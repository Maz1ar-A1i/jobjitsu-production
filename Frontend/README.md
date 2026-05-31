# React Redux Template Project

A comprehensive React application template built with modern technologies including Redux Toolkit, React Query, Vite, and Firebase authentication. This template provides a solid foundation for building scalable React applications with authentication, routing, and state management.

## 🚀 Features

- **Modern React 18** with functional components and hooks
- **Redux Toolkit** for state management with persistence
- **React Query (TanStack Query)** for server state management
- **React Router v6** with lazy loading and route protection
- **Vite** for fast development and building
- **SCSS** for styling with modern CSS features
- **Formik & Yup** for form handling and validation
- **React Toastify** for notifications
- **Firebase Authentication** with Google and Facebook login
- **Axios** for HTTP requests with interceptors
- **Jest & Testing Library** for testing
- **ESLint** for code quality
- **Role-based access control** (Admin, Manager, User roles)

## 📁 Project Structure

```
react-redux-boilerplate/
├── public/                          # Static assets
├── src/
│   ├── assets/                      # Global assets
│   │   ├── global.scss             # Global styles
│   │   ├── images/                 # Image assets
│   │   └── svg/                    # SVG icons
│   ├── components/                  # Reusable components
│   │   ├── common/                 # Common UI components
│   │   │   └── loader/             # Loading spinner
│   │   ├── form-controls/          # Form components
│   │   │   ├── input/              # Input field components
│   │   │   └── select/             # Select field components
│   │   └── menu/                   # Navigation components
│   ├── features/                    # Feature-based modules
│   │   ├── auth/                   # Authentication feature
│   │   │   ├── components/         # Auth-specific components
│   │   │   ├── context/            # Auth context
│   │   │   ├── hooks/              # Custom hooks
│   │   │   ├── slice/              # Redux slice
│   │   │   └── utils/              # Auth utilities
│   │   ├── register/               # Registration feature
│   │   └── user/                   # User management feature
│   ├── helpers/                     # Utility functions
│   ├── pages/                       # Page components
│   │   ├── dashboard/              # Dashboard page
│   │   ├── forgotpassword/         # Password reset page
│   │   ├── homepage/               # Home page
│   │   ├── login/                  # Login page
│   │   └── notfound/               # 404 page
│   ├── routes/                      # Routing configuration
│   │   ├── components/             # Route validators
│   │   ├── privateRoutes.js        # Private routes
│   │   ├── protectedRoutes.js      # Protected routes
│   │   └── publicRoutes.js         # Public routes
│   ├── services/                    # API services
│   │   ├── apis/                   # API endpoints
│   │   └── axios.js                # Axios configuration
│   ├── store/                       # Redux store
│   │   ├── rootReducer.js          # Root reducer
│   │   └── store.js                # Store configuration
│   ├── utils/                       # Utility functions
│   ├── App.jsx                      # Main App component
│   └── main.jsx                     # Application entry point
├── package.json                     # Dependencies and scripts
├── vite.config.js                   # Vite configuration
└── README.md                        # Project documentation
```

## 🛠️ Technology Stack

### Core Technologies

- **React 18.2.0** - UI library
- **Redux Toolkit 1.9.5** - State management
- **React Redux 8.0.5** - React bindings for Redux
- **React Router DOM 6.11.2** - Client-side routing

### Development Tools

- **Vite 4.3.2** - Build tool and dev server
- **ESLint 8.38.0** - Code linting
- **Sass 1.80.6** - CSS preprocessor
- **Jest 27.5.1** - Testing framework

### UI & UX

- **React Toastify 9.1.3** - Toast notifications
- **Formik 2.2.9** - Form management
- **Yup 1.1.1** - Schema validation
- **Bootstrap** - CSS framework (via CDN)

### Data Management

- **React Query (TanStack Query) 4.29.11** - Server state management
- **Axios 1.4.0** - HTTP client
- **Redux Persist 6.0.0** - State persistence

### Authentication

- **Firebase 8.4.1** - Authentication service
- **@react-oauth/google 0.12.1** - Google OAuth
- **@greatsumini/react-facebook-login 3.4.0** - Facebook login

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd react-redux-boilerplate
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:

   ```env
   VITE_APP_API_URL=your_api_base_url
   VITE_APP_API_BASE_URL=your_api_base_url
   ```

4. **Start development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5000`

## 📋 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm test` - Run tests

## 🏗️ Architecture Overview

### State Management

The application uses **Redux Toolkit** for global state management with the following structure:

```javascript
// Store configuration with persistence
const store = configureStore({
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware({ serializableCheck: false });
  },
  reducer: persistedReducer,
});

// Root reducer combining all slices
const rootReducer = combineReducers({
  auth: authSlice,
  // Add more slices here
});
```

### Authentication Flow

1. **Login**: Users can authenticate via email/password, Google, or Facebook
2. **Token Management**: JWT tokens are stored in Redux persist
3. **Route Protection**: Three levels of route protection:
   - **Public Routes**: Accessible to everyone
   - **Private Routes**: Require authentication
   - **Protected Routes**: Require specific roles (admin/manager)

### API Layer

- **Axios Configuration**: Centralized HTTP client with interceptors
- **Service Layer**: Organized API calls by feature
- **Error Handling**: Global error handling with toast notifications

### Component Architecture

- **Feature-based Organization**: Components organized by business features
- **Reusable Components**: Common UI components in `/components/common`
- **Form Components**: Reusable form controls with Formik integration

## 🔐 Authentication & Authorization

### User Roles

- **Admin**: Full access to all features
- **Manager**: Access to protected features
- **User**: Basic authenticated access

### Route Protection

```javascript
// Public routes - accessible to everyone
const publicRoutes = [
  { path: "/", component: Home },
  { path: "/login", component: Login },
];

// Private routes - require authentication
const privateRoutes = [{ path: "/user/pass", component: ChangePassword }];

// Protected routes - require specific roles
const protectedRoutes = [
  { path: "/dashboard", component: Dashboard },
  { path: "/user/create", component: CreateUser },
  { path: "/user/list", component: UserList },
];
```

### Authentication Components

- `PrivateRouteValidator` - Validates user authentication
- `ProtectedRouteValidator` - Validates user roles
- `PublicRouteValidator` - Ensures public access

## 🎨 Styling & UI

### CSS Architecture

- **SCSS**: Modern CSS with variables, mixins, and nesting
- **Global Styles**: Centralized in `src/assets/global.scss`
- **Component Styles**: Co-located with components
- **Bootstrap**: Utility classes and responsive grid

### Component Styling

```scss
// Example component styling
.component-name {
  &__element {
    // BEM methodology
  }

  &--modifier {
    // Modifier classes
  }
}
```

## 📡 API Integration

### Service Structure

```javascript
// Example API service
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

### HTTP Client Configuration

- **Base URL**: Configurable via environment variables
- **Interceptors**: Automatic token injection and error handling
- **Request/Response**: Centralized request/response processing

## 🧪 Testing

### Testing Setup

- **Jest**: Test runner and assertion library
- **React Testing Library**: Component testing utilities
- **Test Environment**: jsdom for DOM simulation

### Running Tests

```bash
npm test                    # Run tests in watch mode
npm test -- --coverage     # Run tests with coverage
npm test -- --verbose      # Run tests with verbose output
```

## 🔧 Configuration

### Vite Configuration

```javascript
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
});
```

### Environment Variables

- `VITE_APP_API_URL`: Base API URL for public endpoints
- `VITE_APP_API_BASE_URL`: Base API URL for authenticated endpoints

## 📦 Build & Deployment

### Production Build

```bash
npm run build
```

### Build Output

- Optimized and minified JavaScript bundles
- CSS extraction and optimization
- Asset optimization and caching

### Deployment Considerations

- Static file hosting (Netlify, Vercel, AWS S3)
- Environment variable configuration
- API endpoint configuration
- CORS settings

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Code Style

### JavaScript/JSX

- Use functional components with hooks
- Prefer const over let
- Use destructuring for props
- Use template literals for string interpolation

### CSS/SCSS

- Use BEM methodology for class naming
- Organize styles with comments
- Use variables for colors and spacing
- Keep components self-contained

### File Naming

- Use kebab-case for file names
- Use PascalCase for component names
- Use camelCase for functions and variables

## 🔍 Troubleshooting

### Common Issues

1. **Build Errors**

   - Check Node.js version compatibility
   - Clear node_modules and reinstall dependencies
   - Verify environment variables

2. **Authentication Issues**

   - Check Firebase configuration
   - Verify API endpoints
   - Check token storage

3. **Styling Issues**
   - Verify SCSS compilation
   - Check import paths
   - Ensure Bootstrap is loaded

## 📚 Additional Resources

- [React Documentation](https://reactjs.org/docs/)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Vite Documentation](https://vitejs.dev/)
- [React Router Documentation](https://reactrouter.com/)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Support

For support and questions:

- Create an issue in the repository
- Contact the development team
- Check the troubleshooting section

---

**Happy Coding! 🚀**
