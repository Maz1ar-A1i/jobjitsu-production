// App.test.js
import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./store/store";
import App from "./App";

describe("App", () => {
  it("renders App component", async () => {
    render(
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <App />
        </PersistGate>
      </Provider>
    );
    const linkElement = await screen.findByText(/Login/i);
    expect(linkElement).toBeInTheDocument();
  });
});
