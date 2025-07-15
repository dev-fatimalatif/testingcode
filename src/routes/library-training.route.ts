import { Routes } from "@/interfaces/routes.interface";
import { Router } from "express";
import { LibraryTrainingController } from "@/controllers/library-training.controller"; // Adjust the path as necessary

export class LibraryTrainingRoute implements Routes {
  public path = '/library-training';
  public router = Router();
  public libraryTrainingController = new LibraryTrainingController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}`, this.libraryTrainingController.createLibraryTraining);
  }
}
