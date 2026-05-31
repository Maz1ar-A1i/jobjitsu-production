import { useSelector } from "react-redux";

export const fetchFromStore = function (reducer) {
  const data = useSelector((state) => state[reducer]);
  return data;
};
