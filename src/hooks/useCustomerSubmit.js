import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

//internal import
import { SidebarContext } from "@/context/SidebarContext";
import CustomerServices from "@/services/UserServices";
import { notifyError, notifySuccess } from "@/utils/toast";

const useCustomerSubmit = (id) => {
  const [imageUrl, setImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { closeDrawer, setIsUpdate } = useContext(SidebarContext);
  const [members, setMembers] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [defaultCategory, setDefaultCategory] = useState([]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      const customerData = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
      };

      if (id) {
        const res = await CustomerServices.updateCustomer(id, customerData);
        setIsUpdate(true);
        notifySuccess(res.message);
        closeDrawer();
      }
      setIsSubmitting(false);
    } catch (err) {
      notifyError(err?.response?.data?.message || err?.message);
      closeDrawer();
    }
  };

  useEffect(() => {
    if (id) {
      (async () => {
        try {
          const res = await CustomerServices.getCustomerById(id);
          if (res) {
            setValue("name", res.name);
            setValue("phone", res.phone);
            setValue("email", res.email);
            setValue("address", res.address);
          }
        } catch (err) {
          notifyError(err?.response?.data?.message || err?.message);
        }
      })();
    }
  }, [id, setValue]);

    const setSearchedText = async (v) => {
      let res = await CustomerServices.searchAdmin(v);
      console.log("setSearchedText ", v, res);
      setMembers(res);
    };

  return {
    register,
    handleSubmit,
    onSubmit,
    errors,
    setImageUrl,
    imageUrl,
    isSubmitting,
    setSearchedText,
    members,
    selectedCategory,
    setSelectedCategory,
    setDefaultCategory,
  };
};

export default useCustomerSubmit;
