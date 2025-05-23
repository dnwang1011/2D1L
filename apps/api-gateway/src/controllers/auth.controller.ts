import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

import { DatabaseService } from '@2dots1line/database'; // Assuming this path is correct from tsconfig
import { UserRepository, CreateUserData } from '@2dots1line/database/repositories/user.repository'; // Adjust path as needed
import { AuthenticatedRequest } from '../middleware/auth.middleware';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

// Initialize services (consider dependency injection for a real app)
const databaseService = new DatabaseService();
const userRepository = new UserRepository(databaseService);

const registerUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  username: z.string().min(3),
  display_name: z.string().optional(),
  region: z.string().min(2), // Assuming region is required
});

const loginUserSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const register = async (req: Request, res: Response) => {
  try {
    const validationResult = registerUserSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ message: 'Invalid input', errors: validationResult.error.errors });
    }

    const { email, password, username, display_name, region } = validationResult.data;

    const existingUser = await userRepository.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }
    const existingUsername = await userRepository.prisma.users.findUnique({where: {username}});
    if (existingUsername) {
        return res.status(409).json({ message: 'User with this username already exists' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const createUserData: CreateUserData = {
      email,
      username,
      password_hash,
      display_name,
      region,
    };

    const newUser = await userRepository.createUser(createUserData);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { hashed_password, ...userWithoutPassword } = newUser; 

    return res.status(201).json({ message: 'User registered successfully', user: userWithoutPassword });

  } catch (error: any) {
    console.error('Registration error:', error);
    if (error.message.includes('already exists')) {
        return res.status(409).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Internal server error during registration' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const validationResult = loginUserSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ message: 'Invalid input', errors: validationResult.error.errors });
    }

    const { email, password } = validationResult.data;

    if (!JWT_SECRET) {
      console.error('JWT_SECRET is not defined.');
      return res.status(500).json({ message: 'Internal server error: JWT configuration missing.' });
    }

    const user = await userRepository.findUserByEmail(email);
    if (!user || !user.hashed_password) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.hashed_password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user.user_id, region: user.region, email: user.email }, // Add other relevant details to payload
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { hashed_password, ...userWithoutPassword } = user;

    return res.status(200).json({ 
      message: 'Login successful', 
      token, 
      user: userWithoutPassword 
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error during login' });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  try {
    const user = await userRepository.findUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { hashed_password, ...userWithoutPassword } = user;
    return res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error('Error fetching current user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}; 