# API Integration Documentation

## Overview

This document provides comprehensive information about the API integration architecture, service patterns, and HTTP client configuration in the React Redux template project.

## 🏗️ API Architecture

### Service Layer Pattern

The application follows a service layer pattern where API calls are organized by business features:

```
src/services/
├── apis/              # API service modules
│   ├── authService.js # Authentication API calls
│   └── userService.js # User management API calls
└── axios.js           # HTTP client configuration
```

## 🔧 HTTP Client Configuration

### Base Configuration

**Location**: `src/services/axios.js`

The application uses two HTTP client instances for different purposes:

```javascript
// Public API client (for authentication)
export const api = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL,
});

// Authenticated API client (for protected endpoints)
const httpClient = axios.create({
  baseURL: import.meta.env.VITE_APP_API_BASE_URL,
});
```

### Request Interceptors

```javascript
// Authentication interceptor
httpClient.interceptors.request.use(
  (config) => {
    // Extract token from Redux persist storage
    const token = JSON.parse(localStorage.getItem("persist:root")).token;

    if (token) {
      config.headers["Authorization"] = "Bearer " + token;
    }

    config.headers["Content-Type"] = "application/json";
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
```

### Response Interceptors

```javascript
// Response interceptor for global error handling
httpClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // Clear authentication state
      store.dispatch(logout());
      // Redirect to login
      window.location.href = "/login";
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      createNotification("error", "Access denied. Insufficient permissions.");
    }

    // Handle 500 Server Error
    if (error.response?.status >= 500) {
      createNotification("error", "Server error. Please try again later.");
    }

    return Promise.reject(error);
  }
);
```

## 🔐 Authentication Services

### AuthService

**Location**: `src/services/apis/authService.js`

#### Login API

```javascript
export const login = async (data) => {
  try {
    const res = await api.post("/api/user/login", { ...data });
    const token = res.headers.get("x-auth-token");
    res.data.token = token;
    return res.data;
  } catch (error) {
    createNotification("error", error.message);
  }
};
```

**Usage**:

```javascript
import { login } from "../services/apis/authService";

const handleLogin = async (credentials) => {
  const response = await login({
    email: credentials.email,
    password: credentials.password,
  });

  if (response) {
    // Handle successful login
    dispatch(setCurrentUser(response.result));
  }
};
```

#### Password Reset API

```javascript
export const forgotPassword = async (data) => {
  try {
    const res = await api.post("/api/user/send_reset_link", { ...data });
    return res.data;
  } catch (error) {
    createNotification("error", error.message);
  }
};

export const resetPassword = async (data) => {
  try {
    const res = await api.post("/api/user/reset_password", { ...data });
    return res.data;
  } catch (error) {
    createNotification("error", error.message);
  }
};
```

#### OAuth Authentication

```javascript
export const googleAuth = async (code) => {
  try {
    const res = await api.get(`/api/auth/google?code=${code}`);
    const token = res.headers.get("x-auth-token");
    res.data.token = token;
    return res.data;
  } catch (error) {
    createNotification("error", error.message);
  }
};

export const facebookAuth = async (code) => {
  try {
    const res = await api.get(`/api/auth/facebook?code=${code}`);
    const token = res.headers.get("x-auth-token");
    res.data.token = token;
    return res.data;
  } catch (error) {
    createNotification("error", error.message);
  }
};
```

## 👥 User Management Services

### UserService

**Location**: `src/services/apis/userService.js`

#### Get All Users

```javascript
export const getAllUsers = async () => {
  try {
    const { data } = await httpClient.get("/posts");
    return data;
  } catch (error) {
    createNotification("error", error.message);
    console.log("Something Went wrong", error.message);
  }
};
```

#### Get Users with Parameters

```javascript
export const getUsers = async (params) => {
  try {
    const res = await httpClient.get("/photos", { params });
    return res.data;
  } catch (error) {
    createNotification("error", error.message);
    console.log("Something Went wrong", error.message);
  }
};
```

#### Create User

```javascript
export const createUser = async (data) => {
  try {
    const res = await httpClient.post("/photos", { data });
    return res.data.data;
  } catch (error) {
    createNotification("error", error.message);
    console.log("Something Went wrong", error.message);
  }
};
```

#### Update User

```javascript
export const updateUser = async (id, data) => {
  try {
    const res = await httpClient.put(`/posts/${id}`, { data });
    return res.data;
  } catch (error) {
    createNotification("error", error.message);
    console.log("Something Went wrong", error.message);
  }
};
```

#### Delete User

```javascript
export const deleteUser = async (id) => {
  try {
    const res = await httpClient.delete(`/posts/${id}`);
    return res.data;
  } catch (error) {
    createNotification("error", error.message);
    console.log("Something Went wrong", error.message);
  }
};
```

## 🔄 React Query Integration

### Query Configuration

The application uses React Query (TanStack Query) for server state management:

```javascript
// Query client configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});
```

### Using React Query with Services

```javascript
// Example: User list with React Query
import { useQuery } from "@tanstack/react-query";
import { getAllUsers } from "../services/apis/userService";

const UserList = () => {
  const {
    data: users,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["users"],
    queryFn: getAllUsers,
  });

  if (isLoading) return <Loader />;
  if (isError) return <ErrorMessage error={error} />;

  return (
    <div>
      {users?.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
};
```

### Mutations with React Query

```javascript
// Example: Create user mutation
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createUser } from "../services/apis/userService";

const CreateUserForm = () => {
  const queryClient = useQueryClient();

  const createUserMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: ["users"] });
      createNotification("success", "User created successfully");
    },
    onError: (error) => {
      createNotification("error", error.message);
    },
  });

  const handleSubmit = (userData) => {
    createUserMutation.mutate(userData);
  };

  return <form onSubmit={handleSubmit}>{/* Form fields */}</form>;
};
```

## 🎯 Error Handling Patterns

### Global Error Handling

```javascript
// Centralized error notification
export const createNotification = (
  type = "info",
  message = "",
  autoclose = 3000,
  position = "top-right"
) => {
  const autoClose = autoclose === false ? false : 3000;

  switch (type) {
    case "info":
      toast.info(message, { autoClose, position });
      break;
    case "success":
      toast.success(message, { autoClose, position });
      break;
    case "warning":
      toast.warning(message, { autoClose, position });
      break;
    case "error":
      toast.error(message, { autoClose, position });
      break;
  }
};
```

### Service-Level Error Handling

```javascript
// Service error handling pattern
export const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await httpClient[endpoint.method](endpoint.url, options);
    return response.data;
  } catch (error) {
    // Log error for debugging
    console.error("API Error:", error);

    // Create user-friendly notification
    const errorMessage = error.response?.data?.message || error.message;
    createNotification("error", errorMessage);

    // Re-throw for component handling
    throw error;
  }
};
```

### Component-Level Error Handling

```javascript
// Component error boundary
const ApiComponent = () => {
  const [error, setError] = useState(null);

  const handleApiCall = async () => {
    try {
      const result = await apiCall();
      // Handle success
    } catch (error) {
      setError(error);
      // Component-specific error handling
    }
  };

  if (error) {
    return <ErrorFallback error={error} onRetry={handleApiCall} />;
  }

  return <div>Component content</div>;
};
```

## 🔐 Authentication Flow

### Token Management

```javascript
// Token storage in Redux persist
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"], // Only persist auth state
};

// Token extraction utility
const getTokenFromStorage = () => {
  try {
    const persistedState = JSON.parse(localStorage.getItem("persist:root"));
    return persistedState?.auth?.token;
  } catch (error) {
    console.error("Error parsing persisted state:", error);
    return null;
  }
};
```

### Authentication State Management

```javascript
// Auth slice with token handling
const authSlice = createSlice({
  name: "auth",
  initialState: {
    currentUser: null,
    loggedIn: false,
    token: null,
  },
  reducers: {
    setCurrentUser: (state, { payload }) => {
      state.currentUser = payload;
      state.loggedIn = true;
      state.token = payload.token;
    },
    logout: (state) => {
      state.currentUser = null;
      state.loggedIn = false;
      state.token = null;
    },
  },
});
```

## 📡 API Endpoints

### Authentication Endpoints

| Method | Endpoint                    | Description         | Auth Required |
| ------ | --------------------------- | ------------------- | ------------- |
| POST   | `/api/user/login`           | User login          | No            |
| POST   | `/api/user/send_reset_link` | Send password reset | No            |
| POST   | `/api/user/reset_password`  | Reset password      | No            |
| GET    | `/api/auth/google`          | Google OAuth        | No            |
| GET    | `/api/auth/facebook`        | Facebook OAuth      | No            |

### User Management Endpoints

| Method | Endpoint     | Description           | Auth Required |
| ------ | ------------ | --------------------- | ------------- |
| GET    | `/posts`     | Get all users         | Yes           |
| GET    | `/photos`    | Get users with params | Yes           |
| POST   | `/photos`    | Create user           | Yes           |
| PUT    | `/posts/:id` | Update user           | Yes           |
| DELETE | `/posts/:id` | Delete user           | Yes           |

## 🔧 Environment Configuration

### Environment Variables

```env
# API Configuration
VITE_APP_API_URL=https://api.example.com
VITE_APP_API_BASE_URL=https://api.example.com/v1

# OAuth Configuration
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_FACEBOOK_APP_ID=your-facebook-app-id

# Feature Flags
VITE_ENABLE_GOOGLE_AUTH=true
VITE_ENABLE_FACEBOOK_AUTH=true
```

### Configuration Management

```javascript
// Configuration utility
export const config = {
  api: {
    baseUrl: import.meta.env.VITE_APP_API_URL,
    baseUrlAuth: import.meta.env.VITE_APP_API_BASE_URL,
  },
  auth: {
    googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    facebookAppId: import.meta.env.VITE_FACEBOOK_APP_ID,
  },
  features: {
    enableGoogleAuth: import.meta.env.VITE_ENABLE_GOOGLE_AUTH === "true",
    enableFacebookAuth: import.meta.env.VITE_ENABLE_FACEBOOK_AUTH === "true",
  },
};
```

## 🧪 Testing API Integration

### Mocking API Calls

```javascript
// Jest mock for API services
jest.mock("../services/apis/authService", () => ({
  login: jest.fn(),
  forgotPassword: jest.fn(),
}));

// Test example
describe("AuthService", () => {
  it("should login user successfully", async () => {
    const mockResponse = {
      data: {
        result: { id: 1, username: "testuser" },
        token: "test-token",
      },
    };

    authService.login.mockResolvedValue(mockResponse);

    const result = await authService.login({
      email: "test@example.com",
      password: "password",
    });

    expect(result).toEqual(mockResponse);
  });
});
```

### Testing with MSW (Mock Service Worker)

```javascript
// MSW setup for API mocking
import { rest } from "msw";
import { setupServer } from "msw/node";

const server = setupServer(
  rest.post("/api/user/login", (req, res, ctx) => {
    return res(
      ctx.json({
        result: { id: 1, username: "testuser" },
        token: "test-token",
      }),
      ctx.set("x-auth-token", "test-token")
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## 📊 Performance Optimization

### Request Caching

```javascript
// React Query caching configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: true,
    },
  },
});
```

### Request Debouncing

```javascript
// Debounced search function
import { debounce } from "lodash";

const debouncedSearch = debounce(async (searchTerm) => {
  const results = await searchUsers(searchTerm);
  setSearchResults(results);
}, 300);
```

### Request Cancellation

```javascript
// Cancellable requests with AbortController
const fetchUsers = async (signal) => {
  try {
    const response = await httpClient.get("/users", { signal });
    return response.data;
  } catch (error) {
    if (error.name === "AbortError") {
      console.log("Request was cancelled");
    } else {
      throw error;
    }
  }
};

// Usage in component
useEffect(() => {
  const abortController = new AbortController();

  fetchUsers(abortController.signal);

  return () => {
    abortController.abort();
  };
}, []);
```

## 🔒 Security Considerations

### Token Security

- Tokens are stored in Redux persist (localStorage)
- Automatic token injection in request headers
- Token expiration handling
- Secure token transmission via HTTPS

### CORS Configuration

```javascript
// CORS headers in API responses
const corsHeaders = {
  "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGINS,
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};
```

### Input Validation

```javascript
// API input validation with Yup
import * as yup from "yup";

const loginSchema = yup.object({
  email: yup.string().email().required(),
  password: yup.string().min(6).required(),
});

// Validation in service
export const login = async (data) => {
  try {
    await loginSchema.validate(data);
    const res = await api.post("/api/user/login", data);
    return res.data;
  } catch (error) {
    if (error.name === "ValidationError") {
      createNotification("error", error.message);
    } else {
      createNotification("error", "Login failed");
    }
  }
};
```

This comprehensive API integration documentation provides developers with detailed information about service patterns, error handling, authentication flows, and best practices for working with APIs in the React Redux template.
