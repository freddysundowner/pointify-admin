import dayjs from "dayjs";
import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

//internal import
import { SidebarContext } from "@/context/SidebarContext";
import { notifyError, notifySuccess } from "@/utils/toast";
import useUtilsFunction from "./useUtilsFunction";
import PackagesServices from "@/services/PackagesServices";

const usePackagesSubmit = (id) => {
  const { isDrawerOpen, closeDrawer, setIsUpdate, lang } =
    useContext(SidebarContext);
  const [imageUrl, setImageUrl] = useState("");
  const [language, setLanguage] = useState(lang);
  const [resData, setResData] = useState({});
  const [published, setPublished] = useState(false);
  const [discountType, setDiscountType] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState([]);
  // const { handlerTextTranslateHandler } = useTranslationValue();
  const { currency } = useUtilsFunction();

  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    console.log("coupon data", data);
    try {
      setIsSubmitting(true);

      const couponData = {
        title: data.title,
        amount: data.amount,
        durationValue: data.durationValue,
        durationUnit: data.durationUnit,
        discount: data.discount,
        amountusd: data.amountusd,
        status: published,
        type: data.type,
      };

      if (id) {
        const res = await PackagesServices.updateCoupon(id, couponData);
        setIsUpdate(true);
        setIsSubmitting(false);
        notifySuccess(res.message);
        closeDrawer();
      } else {
        couponData.type = "production";
        couponData.description = "";
        console.log(couponData);
        const res = await PackagesServices.addCoupon(couponData);
        setIsUpdate(true);
        setIsSubmitting(false);
        notifySuccess(res.message);
        closeDrawer();
      }
    } catch (err) {
      notifyError(err?.response?.data?.message || err?.message);
      setIsSubmitting(false);
      closeDrawer();
    }
  };

  const handleSelectLanguage = (lang) => {
    setLanguage(lang);
    if (Object.keys(resData).length > 0) {
      setValue("title", resData.title[lang ? lang : "en"]);
    }
  };

  useEffect(() => {
    if (!isDrawerOpen) {
      setResData({});
      setValue("title");
      setValue("amount");
      setValue("durationValue");
      setValue("durationUnit");
      setValue("discount");
      setSelectedCategory([]);
      return;
    }
    if (id) {
      (async () => {
        try {
          const res = await PackagesServices.getPackageId(id);
          if (res) {
            setResData(res);
            setValue("title", res.title);
            setValue("amount", res.amount);
            setValue("durationValue", res.durationValue);
            setValue("discount", res.discount);
            setValue("durationUnit", res.durationUnit);
            setValue("amountusd", res.amountusd);
            setValue("maxShops", res.maxShops);
            setValue("type", res.type);

            setPublished(res.status);
          }
        } catch (err) {
          notifyError(err?.response?.data?.message || err?.message);
        }
      })();
    }
  }, [id, setValue, isDrawerOpen, clearErrors, language, lang]);

  return {
    register,
    handleSubmit,
    onSubmit,
    errors,
    setImageUrl,
    imageUrl,
    published,
    setPublished,
    currency,
    discountType,
    isSubmitting,
    setDiscountType,
    handleSelectLanguage,
    selectedCategory,
    setSelectedCategory,
    // setDefaultCategory,
  };
};

export default usePackagesSubmit;
