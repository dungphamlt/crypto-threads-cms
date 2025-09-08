export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (
  password: string
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validatePost = (
  post: any
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!post.title?.trim()) {
    errors.push("Title is required");
  }

  if (!post.content?.trim()) {
    errors.push("Content is required");
  }

  if (!post.category) {
    errors.push("Category is required");
  }

  if (!post.excerpt?.trim()) {
    errors.push("Excerpt is required");
  }

  if (!post.metaDescription?.trim()) {
    errors.push("Meta description is required");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};


