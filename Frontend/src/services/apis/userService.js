import { createNotification } from "../../helpers/createNotifications";
import httpClient from "../axios";

export const getAllUsers = async () => {
    try{
        const { data } = await httpClient.get("/posts");
        return data;
    } catch(error) {
        
        createNotification("error", error.message);
        console.log("Something Went wrong", error.message);
      }
};

export const getUsers = async (params) => {
    try{
        const res = await httpClient.get("/photos", {params});
        return res.data;
    } catch(error) {
        
      createNotification("error", error.message);
      console.log("Something Went wrong", error.message);
    }
};

export const createUser = async (data) => {
    try{
        const res = await httpClient.post("/photos", {data});
        return res.data.data;
    } catch(error) {
        
      createNotification("error", error.message);
      console.log("Something Went wrong", error.message);
    }
};

export const deleteUser = async (id) => {
    try{
        const res = await httpClient.delete(`/posts/${id}`);
        // return res.data.data;
    } catch(error) {
        
      createNotification("error", error.message);
      console.log("Something Went wrong", error.message);
    }
};

export const updateUser = async (id, data) => {
    try{
        const res = await httpClient.put(`/posts/${id}`,{data});
        // return res.data.data;
    } catch(error) {
        
      createNotification("error", error.message);
      console.log("Something Went wrong", error.message);
    }
};
