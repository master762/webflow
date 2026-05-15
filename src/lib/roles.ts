export const canAccessProjects = (role?: string) => {
  return role === "subscriber" || role === "admin" || role === "teacher";
};
