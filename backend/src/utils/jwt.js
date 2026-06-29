import jwt from "jsonwebtoken";

export const generateToken = (id, expiresIn = process.env.JWT_EXPIRES_IN) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn });
};

export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
