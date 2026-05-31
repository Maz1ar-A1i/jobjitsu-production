# Architecture Documentation

## Overview

This React Redux template follows a modern, scalable architecture pattern designed for maintainability and scalability. The architecture is built around feature-based organization, separation of concerns, and modern React patterns.

## 🏗️ Architectural Patterns

### 1. Feature-Based Architecture

The application is organized around business features rather than technical concerns:

```
src/features/
├── auth/           # Authentication feature
├── register/       # Registration feature
└── user/           # User management feature
```

Each feature contains:

- **Components**: Feature-specific UI components
- **Slice**: Redux state management
- **Services**: API calls and business logic
- **Utils**: Feature-specific utilities
- **Hooks**: Custom React hooks
- **Context**: React context if needed

### 2. Layered Architecture

The application follows a layered architecture pattern:

```
┌─────────────────────────────────────┐
│           Presentation Layer        │
│        (Components & Pages)         │
├─────────────────────────────────────┤
│           Business Logic Layer      │
│        (Features & Services)        │
├─────────────────────────────────────┤
│           State Management Layer    │
│        (Redux Store & Slices)       │
├─────────────────────────────────────┤
│           Data Access Layer         │
│        (API Services & Axios)       │
└─────────────────────────────────────┘
```

## 🔄 Data Flow Architecture

### 1. Unidirectional Data Flow

The application follows React's unidirectional data flow:

```
Action → Reducer → Store → Component → UI
   ↑                                    ↓
   └─────────── User Interaction ───────┘
```

### 2. State Management Flow

```javascript
// 1. User Action
const handleLogin = (credentials) => {
  dispatch(loginUser(credentials));
};

// 2. Async Action (Redux Toolkit)
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials) => {
    const response = await authService.login(credentials);
    return response.data;
  }
);

// 3. Slice Reducer
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
      state.loggedIn = true;
    },
  },
});

// 4. Component Subscription
const currentUser = useSelector((state) => state.auth.currentUser);
```

## 🎯 Component Architecture

### 1. Component Hierarchy

```
App
├── Navbar
│   ├── NavAdmin (for admin users)
│   └── NavPublic (for public users)
├── AppRoutes
│   ├── PublicRouteValidator
│   ├── PrivateRouteValidator
│   └── ProtectedRouteValidator
└── ToastContainer
```

### 2. Component Types

#### Container Components

- **Smart Components**: Connected to Redux store
- **Route Components**: Handle routing logic
- **Layout Components**: Provide structure

#### Presentational Components

- **UI Components**: Reusable, stateless components
- **Form Components**: Form-specific components
- **Feature Components**: Business logic components

### 3. Component Communication

```javascript
// Props for parent-child communication
const ChildComponent = ({ data, onAction }) => {
  return <button onClick={() => onAction(data)}>Action</button>;
};

// Context for cross-component communication
const AuthContext = createContext();
const useAuth = () => useContext(AuthContext);

// Redux for global state
const user = useSelector((state) => state.auth.currentUser);
const dispatch = useDispatch();
```

## 🔐 Authentication Architecture

### 1. Multi-Provider Authentication

The application supports multiple authentication providers:

```javascript
// Firebase Authentication
const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
};

// Custom API Authentication
const login = async (credentials) => {
  const response = await api.post("/api/user/login", credentials);
  return response.data;
};
```

### 2. Token Management

```javascript
// Token Storage in Redux Persist
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"], // Only persist auth state
};

// Token Injection in Axios Interceptor
httpClient.interceptors.request.use((config) => {
  const token = JSON.parse(localStorage.getItem("persist:root")).token;
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});
```

### 3. Route Protection Strategy

```javascript
// Three-tier protection system
const PrivateRouteValidator = ({ children }) => {
  const isLogin = IsLogin();
  const currentUser = GetCurrentUser();

  if (!isLogin || !currentUser) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const ProtectedRouteValidator = ({ children }) => {
  const isLogin = IsLogin();
  const currentUser = GetCurrentUser();
  const allowedRoles = ["admin", "manager"];

  if (!isLogin || !currentUser || !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
};
```

## 📡 API Architecture

### 1. Service Layer Pattern

```javascript
// Service organization by feature
src/services/apis/
├── authService.js    # Authentication API calls
├── userService.js    # User management API calls
└── index.js          # Service exports
```

### 2. HTTP Client Configuration

```javascript
// Base API configuration
export const api = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL,
});

// Authenticated API configuration
const httpClient = axios.create({
  baseURL: import.meta.env.VITE_APP_API_BASE_URL,
});

// Request interceptor for authentication
httpClient.interceptors.request.use((config) => {
  const token = getTokenFromStorage();
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      dispatch(logout());
    }
    return Promise.reject(error);
  }
);
```

### 3. Error Handling Strategy

```javascript
// Centralized error handling
export const createNotification = (type, message, autoclose = 3000) => {
  switch (type) {
    case "error":
      toast.error(message, { autoClose: autoclose });
      break;
    case "success":
      toast.success(message, { autoClose: autoclose });
      break;
    // ... other types
  }
};

// Service-level error handling
export const login = async (data) => {
  try {
    const res = await api.post("/api/user/login", { ...data });
    return res.data;
  } catch (error) {
    createNotification("error", error.message);
    throw error;
  }
};
```

## 🎨 Styling Architecture

### 1. SCSS Architecture

```scss
// Global styles
@import "variables";
@import "mixins";
@import "utilities";

// Component styles
.component {
  &__element {
    // BEM methodology
  }

  &--modifier {
    // Modifier classes
  }
}
```

### 2. CSS Organization

```
src/assets/
├── global.scss          # Global styles and variables
├── images/              # Image assets
└── svg/                 # SVG icons

src/components/
├── component/
│   └── component.scss   # Component-specific styles
└── feature/
    └── feature.scss     # Feature-specific styles
```

## 🧪 Testing Architecture

### 1. Testing Strategy

```javascript
// Component testing with React Testing Library
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { store } from "../store/store";

const renderWithProviders = (component) => {
  return render(<Provider store={store}>{component}</Provider>);
};

// Service testing with Jest
describe("AuthService", () => {
  it("should login user successfully", async () => {
    const mockResponse = { data: { user: {}, token: "test-token" } };
    jest.spyOn(api, "post").mockResolvedValue(mockResponse);

    const result = await login({
      email: "test@test.com",
      password: "password",
    });
    expect(result).toEqual(mockResponse.data);
  });
});
```

### 2. Test Organization

```
src/
├── __tests__/           # Test files
├── components/
│   └── Component.test.js
└── features/
    └── Feature.test.js
```

## 🔧 Configuration Architecture

### 1. Environment Configuration

```javascript
// Environment variables
const config = {
  apiUrl: import.meta.env.VITE_APP_API_URL,
  apiBaseUrl: import.meta.env.VITE_APP_API_BASE_URL,
  environment: import.meta.env.MODE,
};

// Feature flags
const features = {
  enableGoogleAuth: true,
  enableFacebookAuth: true,
  enableNotifications: true,
};
```

### 2. Build Configuration

```javascript
// Vite configuration
export default defineConfig({
  plugins: [react(), svgr()],
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ["legacy-js-api"],
        api: "modern",
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          redux: ["@reduxjs/toolkit", "react-redux"],
        },
      },
    },
  },
});
```

## 📊 Performance Architecture

### 1. Code Splitting

```javascript
// Route-based code splitting
const Dashboard = lazy(() => import("../pages/dashboard/dashboard"));
const CreateUser = lazy(() => import("../features/user/create.users"));

// Component-based code splitting
const HeavyComponent = lazy(() => import("./HeavyComponent"));
```

### 2. Bundle Optimization

```javascript
// Dynamic imports for heavy libraries
const loadHeavyLibrary = async () => {
  const { default: HeavyLibrary } = await import("heavy-library");
  return HeavyLibrary;
};

// Tree shaking for unused code
import { specificFunction } from "large-library";
```

## 🔒 Security Architecture

### 1. Authentication Security

- JWT token storage in Redux persist
- Automatic token refresh
- Secure token transmission via HTTPS
- Token expiration handling

### 2. Authorization Security

- Role-based access control (RBAC)
- Route-level protection
- Component-level protection
- API-level protection

### 3. Data Security

- Input validation with Yup schemas
- XSS prevention with proper escaping
- CSRF protection via tokens
- Secure HTTP headers

## 🚀 Scalability Considerations

### 1. State Management Scalability

- Modular Redux slices
- Normalized state structure
- Efficient selectors with memoization
- State persistence for user experience

### 2. Component Scalability

- Reusable component library
- Composition over inheritance
- Props interface documentation
- Component testing coverage

### 3. API Scalability

- Service layer abstraction
- Request/response interceptors
- Error handling strategies
- Caching with React Query

This architecture provides a solid foundation for building scalable, maintainable React applications with modern best practices and patterns.
