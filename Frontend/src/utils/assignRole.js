export const assignRole = (user) => {
    if (user.toLowerCase() == "admin") {
      return "admin";
    } else {
      return "user";
    }
  };