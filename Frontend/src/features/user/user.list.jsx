import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import "./createUser.scss";
import { getUsers } from "../../services/apis/userService";
import LoaderSpinner from "../../components/common/loader/loader.spinner";

const UserList = () => {
  const [pageNo, setPageNo] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["fetchUsers", pageNo],
    queryFn: async () => {
      let data = await getUsers({ _page: pageNo, _limit: 7 });
      return data;
    },
  });

  const onButtonClick = (value) => {
    if (value == "previous") {
      setPageNo((prevState) => prevState - 1);
    } else {
      setPageNo((prevState) => prevState + 1);
    }
  };

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
    <>
      {data?.length &&
        data?.map((user) => {
          return <div key={user?.id}>{`${user?.id}: ${user?.title}`}</div>;
        })}
      <button
        id="prevBtn"
        className="btn btn-primary"
        onClick={() => onButtonClick("previous")}
        disabled={pageNo <= 1}
      >
        Prev
      </button>{" "}
      <button
        id="nextBtn"
        className="btn btn-primary"
        onClick={() => onButtonClick("next  ")}
        disabled={isLoading}
      >
        Next
      </button>
    </>
  );
};

export default UserList;
