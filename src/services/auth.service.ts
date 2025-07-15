import { sign } from 'jsonwebtoken';
import { Service } from 'typedi';
import { AWS_COGNITO_CLIENT_ID, AWS_COGNITO_CLIENT_SECRET, AWS_COGNITO_USER_POOL_ID, AWS_REGION } from '@config';
import { HttpException } from '@exceptions/HttpException';
import { User, UserResponse } from '@interfaces/users.interface';
import { CognitoUserAttribute } from 'amazon-cognito-identity-js';
import { cognito } from '@/config/awsconfig';
import HttpStatus from '@/constants/HttpStatus';
import crypto from 'crypto';
import { AdminSetUserPasswordCommand, AdminSetUserPasswordCommandInput, CognitoIdentityProviderClient, ConfirmForgotPasswordCommand, ConfirmForgotPasswordCommandInput, ForgotPasswordCommand, ForgotPasswordCommandInput, GlobalSignOutCommand, InitiateAuthCommand, InitiateAuthCommandInput, SignUpCommand } from '@aws-sdk/client-cognito-identity-provider';
import { UserModel } from '@/models/users.model';
import { HttpStatusCode } from 'axios';
import { sendEmail } from '@/utils/email';
// import { generateResetToken } from '@/utils/tokenUtils';
// Function to generate SECRET_HASH
const generateSecretHash = username => {
  const message = username + AWS_COGNITO_CLIENT_ID;
  const hmac = crypto.createHmac('sha256', AWS_COGNITO_CLIENT_SECRET);
  hmac.update(message);
  return hmac.digest('base64');
};

@Service()
export class AuthService {
  //   AWS Signup endpoint
  public async awsSignUp(userData: any): Promise<any> {
    const { name,  password, role } = userData;
    const email=userData.email.toLowerCase();
    // Use the provided password or default to 'Numan@123'
    const actualPassword = password || '$$RFP@AutoBid!12$';

    // Flag to indicate if the password is temporary
    const isTemporaryPassword = !password;

    const CognitoParams: any = {
      ClientId: AWS_COGNITO_CLIENT_ID,
      Username: email,
      Password: actualPassword,
      attributes: {
        email: email,
      },
    };
console.log(CognitoParams,"CognitoParams");
console.log(email,"CognitoParams.attributes");
    // Convert attributes to CognitoUserAttribute instances
    const cognitoAttributeList = Object.keys(CognitoParams.attributes).map(
      key => new CognitoUserAttribute({ Name: key, Value: CognitoParams.attributes[key] }),
    );

    try {
      const secretHash = generateSecretHash(CognitoParams.Username);
      CognitoParams.UserAttributes = cognitoAttributeList;
      CognitoParams.SecretHash = secretHash;

      delete CognitoParams['attributes'];

      const newSignupCommand = new SignUpCommand(CognitoParams);
      const result = await cognito.send(newSignupCommand);
      // saving user to mongo db
      const createUserData: UserResponse = (await UserModel.create({ name, email, cognitoUserId: result.UserSub, role ,isTemporaryPassword })).toJSON();

       // If a temporary password was used, send an email with instructions
       if (isTemporaryPassword) {
        const mailContent = `
Hi ${name},

Thank you for signing up on AutoBid. Since you did not specify a password, a temporary password has been set for your account.
Your temporary password is: $$RFP@AutoBid!12$
 
Please confirm your email and then log in with this temporary password.
For security reasons, you will be prompted to change your password immediately after login.
 
Best regards,
AutoBid Customer Support
        `;
        await sendEmail(email, 'Your Temporary Password', mailContent);
      }

      return createUserData;
    } catch (error) {
      console.error('Error signing up user:', error);
      throw new HttpException(400, error.message || 'Failed to sign up');
    }
  }

  //   AWS Sign in endpoint
  // public async awsLogin(credentials: any) {
  //   const { email, password } = credentials;
  //   //   const command = new GlobalSignOutCommand(params);
  //   //Send the command to the Cognito Identity Provider client
  //   //await cognito.send(command);
  //   try {
  //     const authParams: InitiateAuthCommandInput = {
  //       AuthFlow: 'USER_PASSWORD_AUTH',
  //       ClientId: AWS_COGNITO_CLIENT_ID,
  //       AuthParameters: {
  //         USERNAME: email,
  //         PASSWORD: password,
  //         SECRET_HASH: generateSecretHash(email),
  //       },
  //     };

  //     const authCommand = new InitiateAuthCommand(authParams);
  //     const result = await cognito.send(authCommand);

  //     const { AuthenticationResult } = result;
  //     const payload = JSON.parse(Buffer.from(AuthenticationResult.IdToken.split('.')[1], 'base64').toString());
  //     const uniqueIdentifier = payload.sub;

  //     const authUser = await UserModel.findOne({ email, cognitoUserId: uniqueIdentifier }).populate('role');



  //     if (!authUser) throw new HttpException(HttpStatus.UNAUTHORIZED, `Invalid Credentials`);

  //     if (authUser.isTemporaryPassword) {
  //       throw new HttpException(
  //         HttpStatus.FORBIDDEN,
  //         'Please change your password before logging in.'
  //       );
  //     }

  //     return { user: authUser?.toJSON(), token: AuthenticationResult };
  //   } catch (error) {
  //     console.error('Error logging in user:', error);
  //     throw new HttpException(401, 'Incorrect username or password');
  //   }
  // }

  // public async awsLogin(credentials: any) {
  //   const { email, password } = credentials;
  
  //   // 1. Check if user exists in your DB
  //   const authUser = await UserModel.findOne({ email }).populate('role');
  //   if (!authUser) {
  //     throw new HttpException(HttpStatus.UNAUTHORIZED, 'Invalid Credentials');
  //   }
  
  //   // 2. If user has a temporary password, block login immediately
  //   if (authUser.isTemporaryPassword) {
  //     throw new HttpException(
  //       HttpStatus.FORBIDDEN,
  //       'Please change your password before logging in.'
  //     );
  //   }
  
  //   // 3. Proceed with Cognito authentication
  //   try {
  //     const authParams: InitiateAuthCommandInput = {
  //       AuthFlow: 'USER_PASSWORD_AUTH',
  //       ClientId: AWS_COGNITO_CLIENT_ID,
  //       AuthParameters: {
  //         USERNAME: email,
  //         PASSWORD: password,
  //         SECRET_HASH: generateSecretHash(email),
  //       },
  //     };
  
  //     const authCommand = new InitiateAuthCommand(authParams);
  //     const result = await cognito.send(authCommand);
  
  //     const { AuthenticationResult } = result;
  //     if (!AuthenticationResult) {
  //       throw new HttpException(HttpStatus.UNAUTHORIZED, 'Login failed');
  //     }
  
  //     // 4. Verify the Cognito sub matches your DB record
  //     const payload = JSON.parse(
  //       Buffer.from(AuthenticationResult.IdToken.split('.')[1], 'base64').toString()
  //     );
  //     const uniqueIdentifier = payload.sub;
  //     if (authUser.cognitoUserId !== uniqueIdentifier) {
  //       throw new HttpException(HttpStatus.UNAUTHORIZED, 'Invalid Credentials');
  //     }
  
  //     // 5. Return the user and tokens
  //     return { user: authUser.toJSON(), token: AuthenticationResult };
  //   } catch (error) {
  //     console.error('Error logging in user:', error);
  //     throw new HttpException(401, 'Incorrect username or password');
  //   }
  // }


  public async awsLogin(credentials: any) {
    const { email, password, newPassword, confirmPassword } = credentials;
    // console.log(email,"email checking hahaha");
    //       console.log(confirmPassword,"Confirm password 22"); 
    //       console.log(credentials,"Credentials");
          // console.log(confirmPassword,"Confirm password");
  
    // 1. Check if user exists in your DB
    const authUser = await UserModel.findOne({ email }).populate('role');
    if (!authUser) {
      throw new HttpException(HttpStatus.UNAUTHORIZED, 'Invalid Credentials');
    }
    if(authUser.status==0)
    {
      throw new HttpException(HttpStatus.BAD_REQUEST, 'User is Locked');
    }
    // console.log(authUser,"hello dirty");
  
    try {
      // 2. Attempt Cognito authentication with the provided password
      const authParams: InitiateAuthCommandInput = {
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: AWS_COGNITO_CLIENT_ID,
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password,
          SECRET_HASH: generateSecretHash(email),
        },
      };
  
      const authCommand = new InitiateAuthCommand(authParams);
      const result = await cognito.send(authCommand);
      const { AuthenticationResult } = result;
      if (!AuthenticationResult) {
        throw new HttpException(HttpStatus.UNAUTHORIZED, 'Login failed');
      }
  
      // 3. Verify the Cognito sub matches your DB record
      const payload = JSON.parse(
        Buffer.from(AuthenticationResult.IdToken.split('.')[1], 'base64').toString()
      );
      const uniqueIdentifier = payload.sub;
      if (authUser.cognitoUserId !== uniqueIdentifier) {
        throw new HttpException(HttpStatus.UNAUTHORIZED, 'Invalid Credentials');
      }
  
      console.log(authUser.isTemporaryPassword, "Temporary password flag");
      // 4. If the user has a temporary password, handle password update
      if (authUser.isTemporaryPassword) {
        // Check if newPassword and confirmPassword are provided and match
        if (!newPassword || !confirmPassword || newPassword !== confirmPassword) {
          console.log(newPassword,"New password");
          console.log(confirmPassword,"Confirm password");
          throw new HttpException(
            HttpStatus.FORBIDDEN,
            'Please change your password before logging in.'
          );
        }
  
        // Update password in Cognito using AdminSetUserPasswordCommand
        const setPasswordParams: AdminSetUserPasswordCommandInput = {
          UserPoolId: AWS_COGNITO_USER_POOL_ID,
          Username: email,
          Password: newPassword,
          Permanent: true,
        };
  
        try {
          const setPasswordCommand = new AdminSetUserPasswordCommand(setPasswordParams);
          await cognito.send(setPasswordCommand);
        } catch (setPasswordError) {
          console.error('Error updating password in Cognito:', setPasswordError);
          // You can inspect setPasswordError for details on why it's forbidden.
          throw new HttpException(HttpStatus.FORBIDDEN, 'Unable to update password.');
        }
  
        // Update the DB record so the user is no longer flagged with a temporary password
        authUser.isTemporaryPassword = false;
        await authUser.save();
        
        // Optionally re-authenticate using the new password to get a fresh token
        const newAuthParams: InitiateAuthCommandInput = {
          AuthFlow: 'USER_PASSWORD_AUTH',
          ClientId: AWS_COGNITO_CLIENT_ID,
          AuthParameters: {
            USERNAME: email,
            PASSWORD: newPassword,
            SECRET_HASH: generateSecretHash(email),
          },
        };
  
        const newAuthCommand = new InitiateAuthCommand(newAuthParams);
        const newResult = await cognito.send(newAuthCommand);
        if (!newResult.AuthenticationResult) {
          throw new HttpException(HttpStatus.UNAUTHORIZED, 'Login failed after password update');
        }
        return { user: authUser.toJSON(), token: newResult.AuthenticationResult };
      }
  
      // 5. Return the user and tokens for normal login
      return { user: authUser.toJSON(), token: AuthenticationResult };
    } catch (error) {
      console.error('Error logging in user:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(HttpStatus.UNAUTHORIZED, 'Incorrect username or password');
    }
  }
  
  

  public async regenerateAccessToken({ refreshToken, email }: { refreshToken: string; email: string }) {
    try {
      const authParams: InitiateAuthCommandInput = {
        AuthFlow: 'REFRESH_TOKEN_AUTH',
        ClientId: AWS_COGNITO_CLIENT_ID,
        AuthParameters: {
          REFRESH_TOKEN: refreshToken,
          SECRET_HASH: generateSecretHash(email),
        },
      };

      const authCommand = new InitiateAuthCommand(authParams);
      const result = await cognito.send(authCommand);

      const { AuthenticationResult } = result;

      return AuthenticationResult;
    } catch (error) {
      console.error('Error logging in user:', error);
      throw new HttpException(401, 'Incorrect username or password');
    }
  }
  // // Forgot Password Wrapper Method
  // public async initiateForgotPassword(email: string) {
  //   console.log('initiating the forgot password');

  //   const params = {
  //     ClientId: AWS_COGNITO_CLIENT_ID,
  //     Username: email,
  //   };
  //   // Use ForgotPasswordCommand with cognito.send()
  // const command = new ForgotPasswordCommand(params);
  // return await cognito.send(command);
  // }
  // public async confirmForgotPassword(email: string, password: string, verificationCode: string) {
  //   console.log('Inside confirmForgotPassword', verificationCode);

  //   const params = {
  //     ClientId: AWS_COGNITO_CLIENT_ID,
  //     Username: email,
  //     Password: password,
  //     ConfirmationCode: verificationCode,
  //   };

  //   // Use ConfirmForgotPasswordCommand with cognito.send()
  // const command = new ConfirmForgotPasswordCommand(params);

  //   try {
  //     return await cognito.send(command);
  //   } catch (error) {
  //     // Check if the error is due to password reuse
  //     if (error.code === 'InvalidPasswordException' && error.message.includes('previously used password')) {
  //       throw new HttpException(HttpStatus.BAD_REQUEST, 'This password has already been used recently. Please try a different password.');
  //     }

  //     // throw new Error(error.message);
  //     throw new HttpException(HttpStatus.BAD_REQUEST, error.message);
  //   }
  // }
  // //   Change Password Endpoint
  // public async changePassword(email: string, oldPassword: string, newPassword: string) {
  //   const params = {
  //     AuthFlow: 'USER_PASSWORD_AUTH',
  //     ClientId: AWS_COGNITO_CLIENT_ID,
  //     AuthParameters: {
  //       USERNAME: email,
  //       PASSWORD: oldPassword,
  //     },
  //   };

  //   try {
  //     // Authenticate the user to get the AccessToken
  //     const userResponse = await cognito.initiateAuth(params).promise();
  //     const accessToken = userResponse.AuthenticationResult.AccessToken;
  //     // console.log('User Response:', userResponse);

  //     if (!accessToken) {
  //       throw new Error('Failed to retrieve AccessToken');
  //     }

  //     const changePassParams = {
  //       AccessToken: accessToken,
  //       PreviousPassword: oldPassword,
  //       ProposedPassword: newPassword,
  //     };

  //     // Attempt password change
  //     const response = await cognito.changePassword(changePassParams).promise();
  //     console.log({ response });
  //     return response;
  //   } catch (error) {
  //     console.error('Error during password change:', error); // Log the actual error details
  //     throw new HttpException(HttpStatus.BAD_REQUEST, error.message);
  //   }
  // }
  // Forgot Password - Send reset link via email
  
  // public async forgotPassword(email: string): Promise<void> {
  //   const user = await UserModel.findOne({ email });
  //   if (!user) {
  //     throw new HttpException(HttpStatus.NOT_FOUND, 'User not found');
  //   }

  //   // Generate a secure, one-time token (could use JWT or random string)
  //   const resetToken = generateResetToken(email);
  //   const expirationTime = Date.now() + 15 * 60 * 1000; // 15 minutes expiration time

  //   // Store the token and expiration in the database
  //   await UserModel.updateOne(
  //     { email },
  //     { resetToken, resetTokenExpiration: expirationTime }
  //   );

  //   // Send reset password link via email
  //   const resetLink = `https://your-website.com/reset-password?token=${resetToken}`;
  //   await sendEmail(email, 'Password Reset Request', `Click the link to reset your password: ${resetLink}`);
  // }

  // // Reset Password - Set new password after token verification
  // public async resetPassword(token: string, newPassword: string): Promise<void> {
  //   const user = await UserModel.findOne({ resetToken: token });

  //   if (!user) {
  //     throw new HttpException(HttpStatus.NOT_FOUND, 'Invalid or expired reset token');
  //   }

  //   if (Date.now() > user.resetTokenExpiration) {
  //     throw new HttpException(HttpStatus.BAD_REQUEST, 'Reset token has expired');
  //   }

  //   // Hash the new password (use bcrypt or another hashing method)
  //   user.password = await hashPassword(newPassword);
  //   user.resetToken = undefined; // Clear reset token after successful reset
  //   user.resetTokenExpiration = undefined; // Clear expiration
  //   await user.save();
  // }

  
  // Forgot Password: Initiates password reset by sending a verification code to the user's email
  public async forgotPassword(email: string): Promise<void> {
    console.log('Inside resetPassword', email);
    const params: ForgotPasswordCommandInput = {
      ClientId: AWS_COGNITO_CLIENT_ID, // Your Cognito Client ID
      Username: email,
      SecretHash: generateSecretHash(email),
    };
    console.log('Inside resetPassword', params);
    try {
      console.log('entering try');
      const command = new ForgotPasswordCommand(params);
      console.log('IN try',command);
      await cognito.send(command); // Send the password reset email
    } catch (error) {
      console.error('Error initiating forgot password:', error);
      throw new HttpException(HttpStatus.BAD_REQUEST, 'Unable to initiate password reset');
    }
  }

  // Confirm Forgot Password: Verify the code and reset the password
  public async resetPassword(email: string, newPassword: string, verificationCode: string): Promise<void> {
    
    const params: ConfirmForgotPasswordCommandInput = {
      ClientId: AWS_COGNITO_CLIENT_ID, // Your Cognito Client ID
      Username: email,
      Password: newPassword,
      ConfirmationCode: verificationCode, // Verification code from email
      SecretHash: generateSecretHash(email),
    };

    try {
      const command = new ConfirmForgotPasswordCommand(params);
      await cognito.send(command); // Confirm the reset with new password
    } catch (error) {
      console.error('Error confirming forgot password:', error);
      throw new HttpException(HttpStatus.BAD_REQUEST, 'Unable to reset the password');
    }
  }



  public async logout(userData: any): Promise<User> {
    const findUser: User = await UserModel.findOne({ email: userData.email, cognitoUserId: userData.cognitoUserId });
    if (!findUser) throw new HttpException(HttpStatusCode.NotFound, `This email ${userData.email} was not found`);

    return findUser;
  }
}
