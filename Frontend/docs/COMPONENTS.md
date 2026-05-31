# Components Documentation

## Overview

This document provides detailed information about all components in the React Redux template project, their purposes, props, and usage examples.

## 📁 Component Organization

### Directory Structure

```
src/components/
├── common/              # Shared UI components
│   └── loader/         # Loading components
├── form-controls/      # Form-related components
│   ├── input/         # Input field components
│   └── select/        # Select field components
└── menu/              # Navigation components
```

## 🔄 Common Components

### Loader Component

**Location**: `src/components/common/loader/loader.spinner.jsx`

**Purpose**: Provides a consistent loading spinner across the application.

**Props**:

- `size` (number): Size of the spinner in pixels
- `role` (string): ARIA role for accessibility
- `className` (string): Additional CSS classes

**Usage**:

```jsx
import Loader from './components/common/loader/loader.spinner';

// Basic usage
<Loader />

// With custom size
<Loader size={32} />

// With custom classes
<Loader size={16} className="spinner-border" role="status" />
```

**Features**:

- Responsive design
- Accessibility support
- Customizable size
- Bootstrap-compatible styling

## 📝 Form Control Components

### TextFieldFormik Component

**Location**: `src/components/form-controls/input/text.field.formik.jsx`

**Purpose**: A reusable text input component that integrates with Formik for form management.

**Props**:

- `name` (string): Field name for Formik
- `id` (string): HTML id attribute
- `type` (string): Input type (text, password, email, etc.)
- `placeholder` (string): Placeholder text
- `label` (string): Field label
- `labelClassName` (string): CSS classes for label
- `disabled` (boolean): Disable the input
- `values` (object): Formik values object
- `errors` (object): Formik errors object
- `touched` (object): Formik touched object
- `handleChange` (function): Formik change handler
- `handleBlur` (function): Formik blur handler

**Usage**:

```jsx
import { TextFieldFormik } from "./components/form-controls/input/text.field.formik";

// In a Formik form
<TextFieldFormik
  name="username"
  id="username"
  type="text"
  placeholder="Enter username"
  label="Username"
  labelClassName="form-label"
  disabled={loading}
  {...formikProps}
/>;
```

**Features**:

- Formik integration
- Error handling and display
- Label support
- Accessibility features
- Bootstrap styling

### SelectFormik Component

**Location**: `src/components/form-controls/select/select.fromik.jsx`

**Purpose**: A reusable select dropdown component that integrates with Formik.

**Props**:

- `name` (string): Field name for Formik
- `id` (string): HTML id attribute
- `label` (string): Field label
- `options` (array): Array of option objects
- `placeholder` (string): Placeholder text
- `disabled` (boolean): Disable the select
- Formik props (values, errors, touched, handleChange, handleBlur)

**Usage**:

```jsx
import { SelectFormik } from "./components/form-controls/select/select.fromik";

const options = [
  { value: "admin", label: "Administrator" },
  { value: "user", label: "User" },
  { value: "manager", label: "Manager" },
];

<SelectFormik
  name="role"
  id="role"
  label="User Role"
  options={options}
  placeholder="Select a role"
  {...formikProps}
/>;
```

**Features**:

- Formik integration
- Dynamic options
- Error handling
- Accessibility support

## 🧭 Menu Components

### Navbar Component

**Location**: `src/components/menu/nav.jsx`

**Purpose**: Main navigation component that renders different navigation based on user role and authentication status.

**Props**:

- `currentUser` (object): Current authenticated user object
- `loggingStatus` (boolean): User authentication status

**Usage**:

```jsx
import Navbar from "./components/menu/nav";

<Navbar currentUser={currentUser} loggingStatus={isLoggedIn} />;
```

**Features**:

- Role-based navigation rendering
- Dynamic logo display
- Logout functionality
- Responsive design

### NavAdmin Component

**Location**: `src/components/menu/nav.admin.jsx`

**Purpose**: Navigation component specifically for admin users.

**Props**:

- `currentUser` (object): Current admin user object
- `handeleLogout` (function): Logout handler function

**Features**:

- Admin-specific navigation links
- User profile display
- Logout functionality
- Dashboard access

### NavPublic Component

**Location**: `src/components/menu/nav.public.jsx`

**Purpose**: Navigation component for public/unauthenticated users.

**Props**:

- `currentUser` (object): Current user object (null for public)
- `loggingStatus` (boolean): Authentication status
- `handeleLogout` (function): Logout handler

**Features**:

- Public navigation links
- Login/Register buttons
- Conditional rendering based on auth status

## 🏠 Page Components

### Homepage Component

**Location**: `src/pages/homepage/homepage.jsx`

**Purpose**: Main landing page of the application.

**Features**:

- Welcome message
- Feature highlights
- Call-to-action buttons
- Responsive design

### Login Component

**Location**: `src/pages/login/login.jsx`

**Purpose**: Authentication page with multiple login options.

**Features**:

- Email/password login
- Google OAuth integration
- Facebook OAuth integration
- Password reset functionality
- Form validation
- Loading states

**Usage**:

```jsx
import Login from "./pages/login/login";

// Rendered via routing
<Route path="/login" element={<Login />} />;
```

### Dashboard Component

**Location**: `src/pages/dashboard/dashboard.jsx`

**Purpose**: Admin dashboard with user management features.

**Features**:

- User statistics
- Quick actions
- Navigation to user management
- Role-based content

### NotFound Component

**Location**: `src/pages/notfound/notFound.jsx`

**Purpose**: 404 error page for invalid routes.

**Features**:

- User-friendly error message
- Navigation back to home
- Consistent styling

## 🔐 Route Validator Components

### PrivateRouteValidator Component

**Location**: `src/routes/components/PrivateRouteValidator.jsx`

**Purpose**: Validates user authentication for private routes.

**Props**:

- `children` (node): Child components to render if authenticated

**Usage**:

```jsx
import PrivateRouteValidator from "./routes/components/PrivateRouteValidator";

<PrivateRouteValidator>
  <ProtectedComponent />
</PrivateRouteValidator>;
```

**Features**:

- Authentication check
- Role validation
- Automatic redirect to home if unauthorized

### ProtectedRouteValidator Component

**Location**: `src/routes/components/ProtectedRouteValidator.jsx`

**Purpose**: Validates user roles for protected routes.

**Props**:

- `children` (node): Child components to render if authorized

**Features**:

- Role-based access control
- Admin/Manager role validation
- Automatic redirect if unauthorized

### PublicRouteValidator Component

**Location**: `src/routes/components/PublicRouteValidator.jsx`

**Purpose**: Ensures routes are accessible to public users.

**Features**:

- Public access validation
- Redirect logic for authenticated users

## 🎨 Feature Components

### LoginForm Component

**Location**: `src/features/auth/login.form.jsx`

**Purpose**: Reusable login form with Formik integration.

**Props**:

- `onSubmit` (function): Form submission handler
- `onForgotPassword` (function): Password reset handler
- `loading` (boolean): Loading state

**Usage**:

```jsx
import LoginForm from "./features/auth/login.form";

<LoginForm
  onSubmit={handleLogin}
  onForgotPassword={handlePasswordReset}
  loading={isLoading}
/>;
```

**Features**:

- Formik form management
- Yup validation
- Password reset integration
- Loading states
- Error handling

### CreateUser Component

**Location**: `src/features/user/create.users.jsx`

**Purpose**: User creation form with React Query integration.

**Features**:

- React Query for data fetching
- Form validation
- Loading states
- Error handling
- Success feedback

### UserList Component

**Location**: `src/features/user/user.list.jsx`

**Purpose**: Displays list of users with management capabilities.

**Features**:

- User data display
- Search functionality
- Pagination
- User actions (edit, delete)

## 🔧 Authentication Components

### GoogleLogin Component

**Location**: `src/pages/login/components/GoogleLogin.jsx`

**Purpose**: Google OAuth login button.

**Props**:

- `onSuccess` (function): Success callback
- `onError` (function): Error callback

**Features**:

- Google OAuth integration
- Automatic token handling
- Error handling

### FacebookLogin Component

**Location**: `src/pages/login/components/FacebookLogin.jsx`

**Purpose**: Facebook OAuth login button.

**Features**:

- Facebook OAuth integration
- Automatic token handling
- Error handling

## 📱 Component Patterns

### Higher-Order Components (HOCs)

The project uses HOCs for route protection:

```jsx
// Route protection pattern
const ProtectedComponent = ({ children }) => {
  const isAuthenticated = checkAuth();
  const hasRole = checkRole();

  if (!isAuthenticated || !hasRole) {
    return <Navigate to="/login" />;
  }

  return children;
};
```

### Render Props Pattern

Used in form components for flexibility:

```jsx
// Form component with render props
<Formik
  initialValues={initialValues}
  validationSchema={schema}
  onSubmit={onSubmit}
>
  {({ values, errors, touched, handleChange, handleBlur }) => (
    <form>{/* Form fields */}</form>
  )}
</Formik>
```

### Compound Components

Used for complex UI patterns:

```jsx
// Navigation compound component
<Navbar>
  <Navbar.Brand />
  <Navbar.Menu />
  <Navbar.Auth />
</Navbar>
```

## 🎯 Component Best Practices

### 1. Props Interface

```jsx
// PropTypes for type checking
Component.propTypes = {
  title: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  children: PropTypes.node,
};

// Default props
Component.defaultProps = {
  onClick: () => {},
  children: null,
};
```

### 2. Component Composition

```jsx
// Prefer composition over inheritance
const UserCard = ({ user, actions }) => (
  <Card>
    <Card.Header>
      <UserAvatar user={user} />
      <UserInfo user={user} />
    </Card.Header>
    <Card.Body>
      <UserActions actions={actions} />
    </Card.Body>
  </Card>
);
```

### 3. Error Boundaries

```jsx
// Error boundary for component error handling
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

## 🧪 Component Testing

### Testing Strategy

```jsx
// Component test example
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { store } from "../store/store";

describe("LoginForm", () => {
  it("should submit form with valid data", () => {
    const mockOnSubmit = jest.fn();

    render(
      <Provider store={store}>
        <LoginForm onSubmit={mockOnSubmit} />
      </Provider>
    );

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "testuser" },
    });

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    expect(mockOnSubmit).toHaveBeenCalledWith({
      username: "testuser",
      password: "",
    });
  });
});
```

### Testing Utilities

```jsx
// Custom render function with providers
const renderWithProviders = (component, options = {}) => {
  const { store = defaultStore, ...renderOptions } = options;

  const Wrapper = ({ children }) => (
    <Provider store={store}>
      <BrowserRouter>{children}</BrowserRouter>
    </Provider>
  );

  return render(component, { wrapper: Wrapper, ...renderOptions });
};
```

## 📊 Component Performance

### Optimization Techniques

1. **React.memo** for expensive components
2. **useMemo** for expensive calculations
3. **useCallback** for function props
4. **Lazy loading** for large components

```jsx
// Performance optimization example
const ExpensiveComponent = React.memo(({ data, onAction }) => {
  const processedData = useMemo(() => {
    return data.map((item) => expensiveProcessing(item));
  }, [data]);

  const handleAction = useCallback(
    (id) => {
      onAction(id);
    },
    [onAction]
  );

  return (
    <div>
      {processedData.map((item) => (
        <Item key={item.id} item={item} onAction={handleAction} />
      ))}
    </div>
  );
});
```

This comprehensive component documentation provides developers with detailed information about each component's purpose, usage, and best practices for working with the React Redux template.
