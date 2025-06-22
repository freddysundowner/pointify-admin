import { useContext, useEffect, useState } from "react";
import { SidebarContext } from "@/context/SidebarContext";

const useToggleDrawer = () => {
  const [serviceId, setServiceId] = useState("");
  const [userId, setUserId] = useState("");
  const [allId, setAllId] = useState([]);
  const [title, setTitle] = useState("");
  const { toggleDrawer, isDrawerOpen, toggleModal, toggleBulkDrawer } =
    useContext(SidebarContext);

  const handleUpdate = (id) => {
    setServiceId(id);
    toggleDrawer();
  };

  const handleUpdateMany = (id) => {
    setAllId(id);
    toggleBulkDrawer();
  };

  const handleModalOpen = (id, title) => {
    setServiceId(id);
    toggleModal();
    setTitle(title);
  };

  const setUserIdData = (data) => {
    console.log(data);
    setUserId(data);
  };

  useEffect(() => {
    if (!isDrawerOpen) {
      setServiceId();
    }
  }, [isDrawerOpen]);

  const handleDeleteMany = async (id, products) => {
    setAllId(id);
    toggleModal();
    setTitle("Selected Products");
  };

  return {
    title,
    allId,
    serviceId,
    handleUpdate,
    setServiceId,
    handleModalOpen,
    handleDeleteMany,
    handleUpdateMany,
    userId,
    setUserIdData,
  };
};

export default useToggleDrawer;
