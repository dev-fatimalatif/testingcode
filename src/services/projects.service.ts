import { Service } from 'typedi';
import { HttpException } from '@exceptions/HttpException';
import { ProjectFindQueryI, ProjectI, ProjectListI, ProjectListRecordI } from '@/interfaces/projects.interface';
import { ProjectModel } from '@models/projects.model';
import HttpStatus from '@/constants/HttpStatus';
import mongoose, { FilterQuery } from 'mongoose';
import { RoleEnum } from '@/interfaces/permissions.interface';
import { UserTokenData } from '@/interfaces/users.interface';

@Service()
export class ProjectService {
  public async findAllProject(queryData: ProjectFindQueryI, loginedUser: UserTokenData): Promise<ProjectListI> {
    const { currentPage, limit, sortColumn, sortby, projectName, products, owner, status } = queryData ?? {};

    const query: Record<string, string | any> = {};
    if (projectName) {
      query.name = { $regex: new RegExp(projectName, 'i') };
    }

    console.log({ products });
    if (products) {
      query.products = { $in: products.split(',').map(id => new mongoose.Types.ObjectId(id)) };
    }
    if (owner) {
      query.owner = { $regex: new RegExp(owner, 'i') };
    }

    if (status) {
      query.status = +status;
    }

    const currentUserRole = loginedUser.role.name;

    const currentUserId = loginedUser._id;

    const findQuery: FilterQuery<ProjectListRecordI> = {};

    if ([RoleEnum.PROJECT_CREATOR, RoleEnum.PROJECT_COLLABORATOR].includes(currentUserRole)) {
      findQuery['$or'] = [
        {
          'questions.collaborators': { $in: [currentUserId] },
        },
        { 'collaborators._id': { $in: [currentUserId] } },
      ];
      if (currentUserRole === RoleEnum.PROJECT_CREATOR) {
        findQuery['$or'].push({
          'createdBy._id': new mongoose.Types.ObjectId(currentUserId),
        });
      }
    }


    const projectCount = await ProjectModel.aggregate([
      {
        // Match all documents in the Project collection
        $match: query,
      },
      {
        // Lookup to join QuestionAnswer documents by the project field
        $lookup: {
          from: 'questions-answers', // Collection name of QuestionAnswer documents
          localField: '_id', // Field in Project
          foreignField: 'project', // Field in QuestionAnswer that references Project
          as: 'questions', // Name for the joined array
        },
      },
      {
        // Lookup to join QuestionAnswer documents by the project field
        $lookup: {
          from: 'users', // Collection name of QuestionAnswer documents
          localField: 'createdBy', // Field in Project
          foreignField: '_id', // Field in QuestionAnswer that references Project
          as: 'createdBy', // Name for the joined array
        },
      },
      {
        // Lookup to join QuestionAnswer documents by the project field
        $lookup: {
          from: 'users', // Collection name of QuestionAnswer documents
          localField: 'collaborators', // Field in Project
          foreignField: '_id', // Field in QuestionAnswer that references Project
          as: 'collaborators', // Name for the joined array
        },
      },


      { $unwind: '$createdBy' },
      {
        $match: findQuery,
      },
      // { $unwind: '$region' },
      {
        // Count the number of documents that match the conditions
        $count: 'totalCount',
      },
    ]);
    const countDocment = projectCount[0]?.totalCount || 0;
    console.log({ findQuery });
    // const findQuery: FilterQuery<ProjectListRecordI> = {};

    // if ([RoleEnum.PROJECT_CREATOR, RoleEnum.PROJECT_COLLABORATOR].includes(currentUserRole)) {
    //   findQuery['questions.collaborators'] = { $elemMatch: { $eq: currentUserId } };
    // }

    const projects: ProjectListRecordI[] = await ProjectModel.aggregate([
      {
        // Match all documents in the Project collection
        $match: query,
      },
      {
        $addFields: {
          projectSubProducts: { $ifNull: ['$subProducts', []] }, // Ensure subProducts is always an array
        },
      },
      {
        // Lookup to join QuestionAnswer documents by the project field
        $lookup: {
          from: 'questions-answers', // Collection name of QuestionAnswer documents
          localField: '_id', // Field in Project
          foreignField: 'project', // Field in QuestionAnswer that references Project
          as: 'questions', // Name for the joined array
        },
      },
      {
        // Lookup to join QuestionAnswer documents by the project field
        $lookup: {
          from: 'users', // Collection name of QuestionAnswer documents
          localField: 'createdBy', // Field in Project
          foreignField: '_id', // Field in QuestionAnswer that references Project
          as: 'createdBy', // Name for the joined array
        },
      },
      {
        // Lookup to join QuestionAnswer documents by the project field
        $lookup: {
          from: 'users', // Collection name of QuestionAnswer documents
          localField: 'collaborators', // Field in Project
          foreignField: '_id', // Field in QuestionAnswer that references Project
          as: 'collaborators', // Name for the joined array
        },
      },

      {
        $lookup: {
          from: 'products',
          localField: 'products',
          foreignField: '_id',
          as: 'products',
          let: { projectSubProducts: '$projectSubProducts' },
          pipeline: [
            {
              // Exclude fields from QuestionAnswer documents in lookup
              $project: {
                createdAt: 0,
                updatedAt: 0,
              },
            },

            {
              // Filter the subProducts to only include those in the project's subProducts array
              $addFields: {
                subProducts: {
                  $filter: {
                    input: '$subProducts', // The array of subProducts in the product
                    as: 'subProduct',
                    cond: {
                      // Match subProduct._id with the project.subProducts array
                      $in: ['$$subProduct._id', '$$projectSubProducts'],
                    },
                  },
                },
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: 'regions',
          localField: 'regions',
          foreignField: '_id',
          as: 'regions',
          pipeline: [
            {
              // Exclude fields from QuestionAnswer documents in lookup
              $project: {
                createdAt: 0,
                updatedAt: 0,
              },
            },
          ],
        },
      },

      { $unwind: '$createdBy' },
      {
        $match: findQuery,
      },
      // { $unwind: '$region' },
      {
        $addFields: {
          reviewedCount: {
            $size: {
              $filter: {
                input: '$questions',
                as: 'question',
                cond: { $eq: ['$$question.markReviewed', true] },
              },
            },
          },
          completedCount: {
            $size: {
              $filter: {
                input: '$questions',
                as: 'question',
                cond: { $eq: ['$$question.markCompleted', true] },
              },
            },
          },
          totalQuestions: {
            $size: '$questions',
          },
        },
      },

      {
        $set: {
          lowerCaseName: { $toLower: '$name' }, // Convert 'name' field to lowercase
        },
      },
      {
        $sort: {
          [sortColumn]: sortby,
        },
      },
      {
        // Optional: Remove the questions array to keep only count and project fields
        $project: {
          questions: 0,
          lowerCaseName: 0,
          subProducts: 0,
          projectSubProducts: 0,
        },
      },
      {
        // Pagination: Skip the first (page-1) * limit results
        $skip: (currentPage - 1) * limit,
      },
      {
        // Limit the number of results to the page size
        $limit: limit,
      },
    ]);

    return { content: projects, totalRecords: countDocment };
  }

  public async findProjectById(projectId: string): Promise<ProjectI> {
    const findProject: ProjectI = await ProjectModel.findOne({ _id: projectId })
      .populate('regions', { createdAt: 0, updatedAt: 0 })
      .populate('products', { createdAt: 0, updatedAt: 0 });

    if (!findProject) throw new HttpException(HttpStatus.NOT_FOUND, "Project doesn't exist");
    // const subProducts = (findProject.product as unknown as ProductsI).subProducts;
    // (findProject.product as unknown as ProductsI).subProducts = subProducts.filter(({ _id }) => {
    //   return (findProject.subProducts as unknown as string[]).includes(_id);
    // });
    // delete findProject['subProducts'];
    return findProject;
  }

  public async createProject(projectData: ProjectI): Promise<ProjectI> {
    const createProjectData: ProjectI = await ProjectModel.create(projectData);

    return createProjectData;
  }

  public async updateProject(projectId: string, projectData: Partial<ProjectI>): Promise<ProjectI> {
    const updateProjectById: ProjectI = await ProjectModel.findByIdAndUpdate(projectId, projectData, { new: true });
    if (!updateProjectById) throw new HttpException(HttpStatus.NOT_FOUND, "Project doesn't exist");
    return updateProjectById;
  }

  public async deleteProject(projectId: string): Promise<ProjectI> {
    const deleteProjectById = await ProjectModel.findByIdAndDelete(projectId);
    if (!deleteProjectById) throw new HttpException(HttpStatus.NOT_FOUND, "Project doesn't exist");

    return deleteProjectById;
  }
}
