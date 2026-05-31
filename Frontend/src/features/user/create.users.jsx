import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import "./createUser.scss";
import { createUser } from "../../services/apis/userService";
import LoaderSpinner from "../../components/common/loader/loader.spinner";

const CreateUser = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["createUser"],
    queryFn: async () => {
      const createdUser = await createUser({
        title: "Ahmed",
        body: "Software Engineer",
        userId: 1,
        role: "admin",
      });
      return createdUser;
    },
  });

  if (isLoading) {
    return (
      <>
        <LoaderSpinner size={32} role="status" className="spinner-border" />
      </>
    );
  }

  if (isError) {
    return (
      <>
        <h1> Something went wrong</h1>
      </>
    );
  }

  return (
    <div className="create-user-wrapper">
      <div className="create-user-box box-wrapper">
        <h1 className="heading-page">{"Creating a User"}</h1>
        {data && (
          <>
            <p>New user</p>
            <div>Name: {data?.title}</div>
            <div>Designation: {data?.body}</div>
          </>
        )}
      </div>
    </div>
  );
};
export default CreateUser;
