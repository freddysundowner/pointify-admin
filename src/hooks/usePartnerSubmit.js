import combinate from "combinate";
import { useContext, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation } from "react-router-dom";
import swal from "sweetalert";

//internal import
import useAsync from "@/hooks/useAsync";
import { SidebarContext } from "@/context/SidebarContext";
import AttributeServices from "@/services/AttributeServices";
import ProductServices from "@/services/ProductServices";
import { notifyError, notifySuccess } from "@/utils/toast";
// import useTranslationValue from "./useTranslationValue";
import useUtilsFunction from "./useUtilsFunction";
import PartnersServices from "@/services/PartnersServices";

const usePartnerSubmit = (id) => {
  const location = useLocation();
  const { isDrawerOpen, closeDrawer, setIsUpdate, lang } =
    useContext(SidebarContext);

  const [values, setValues] = useState({});
  const [partnerId, setPartnerId] = useState("");
  const [resData, setResData] = useState({});
  const [openModal, setOpenModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);


  // handle click
  const onCloseModal = () => setOpenModal(false);
  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    console.log('data is data',data)
    try {
      setIsSubmitting(true);
      const partnerData = {
        id: partnerId,
        name: data.name,
        email: data.email,
        phonenumber: data.phonenumber,
      };

      if (partnerId) {
        const res = await PartnersServices.updatePartner(partnerId, partnerData);
        if (res) {
            setIsUpdate(true);
            notifySuccess(res.message);
            setIsSubmitting(false);
        }
      } else {
        const res = await PartnersServices.addAffliate(partnerData);
        setIsUpdate(true);
          notifySuccess("Affliate Added Successfully!");
          closeDrawer();
      }
    } catch (err) {
      // console.log("err", err);
      setIsSubmitting(false);
      notifyError(err?.response?.data?.error || err?.error);
      // closeDrawer();
    }
  };

  useEffect(() => {
    if (!isDrawerOpen) {
      setResData({});
      setValue("name");
      setValue("email");
      setValue("phonenumber");
      setValue("partnerId");

      setPartnerId("");
      setValues({});

      clearErrors("show");
      setIsSubmitting(false);

      return;
    }

    if (id) {
      (async () => {
        try {
          const res = await PartnersServices.getPartnerById(id);

          if (res) {
            setResData(res);
            setUpdatedId(res._id);
            setValue("name", res.name);
            setValue("email", res.email);
            setValue("phonenumber", res.phonenumber);
            setValue("wallet", res.wallet);
          }
        } catch (err) {
          notifyError(err?.response?.data?.message || err?.message);
        }
      })();
    }
  }, [
    id,
    setValue,
    isDrawerOpen,
    location.pathname,
    clearErrors,
    lang,
  ]);


  return {
    values,
    register,
    onSubmit,
    errors,
    openModal,
    setValues,
    handleSubmit,
    partnerId,
    onCloseModal,
    isSubmitting,
  };
};

export default usePartnerSubmit;
