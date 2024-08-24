import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

//internal import
// import useNotification from "./useNotification";
import { SidebarContext } from "@/context/SidebarContext";
import SettingServices from "@/services/SettingServices";
import { notifyError, notifySuccess } from "@/utils/toast";
import { useDispatch } from "react-redux";
import { removeSetting } from "@/reduxStore/slice/settingSlice";

const useSettingSubmit = (id) => {
  const dispatch = useDispatch();
  const { setIsUpdate } = useContext(SidebarContext);
  const [isSave, setIsSave] = useState(true);
  const [forceUpdate, setForceUpdate] = useState(false);
  const [stripe, setStripe] = useState(false);
  const [paystack, setPaystack] = useState(false);
  const [flutterwave, setFlutterWave] = useState(false);
  

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [discovershops, setDiscoverShops] = useState(false);
  const [verifyemail, setVerifyEmail] = useState(false);

  // const { socket } = useNotification();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      const settingData = {
        name: "globalSetting",
        setting: {
          android_version: data.android_version,
          ios_version: data.ios_version,
          demolink: data.demolink,
          contact: data.contact,
          email: data.email,
          website: data.website,
          forceUpdate: forceUpdate,
          stripe_secret_key: data.stripe_secret_key,
          stripe_publishable_key: data.stripe_publishable_key,
          paystack_secret_key: data.paystack_secret_key,
          paystack_public_key: data.paystack_public_key,
          SmtpType: data.SmtpType,
          SmtpPassword: data.SmtpPassword,
          SmtpEmail: data.SmtpEmail,
          google_api_key: data.google_api_key,
          enablepaystack: paystack,
          enablestripe: stripe,
          discovershops: discovershops,
          verifyemail:verifyemail,
          appName: data.appName,
          flutterwavepublickey:data.flutterwavepublickey,
          enableflutterwave: flutterwave,
        },
      };

      if (!isSave) {
        const res = await SettingServices.updateGlobalSetting(settingData);
        setIsUpdate(true);
        setIsSubmitting(false);
        dispatch(removeSetting("globalSetting"));

        // window.location.reload();
        notifySuccess(res.message);
      } else {
        const res = await SettingServices.addGlobalSetting(settingData);
        setIsUpdate(true);
        setIsSubmitting(false);

        // window.location.reload();
        notifySuccess(res.message);
      }
    } catch (err) {
      // console.log("err", err);
      notifyError(err?.response?.data?.message || err?.message);
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await SettingServices.getGlobalSetting();
        if (res) {
          setIsSave(false);
          setValue("ios_version", res.ios_version);
          setValue("android_version", res.android_version);
          setValue("website", res.website);
          setValue("forceUpdate", res.forceUpdate);
          setValue("stripe_secret_key", res.stripe_secret_key);
          setValue("stripe_publishable_key", res.stripe_publishable_key);
          setValue("paystack_secret_key", res.paystack_secret_key);
          setValue("paystack_public_key", res.paystack_public_key);
          setValue("google_api_key", res.google_api_key);
          setValue("verifyemail", res.verifyemail);
          setValue("SmtpType", res.SmtpType);
          setValue("SmtpEmail", res.SmtpEmail);
          setValue("SmtpPassword", res.SmtpPassword);
          setValue("appName", res.appName);
          setFlutterWave("flutterwavepublickey", res.flutterwavepublickey);
          
          setStripe(res.enablestripe);
          setPaystack(res.enablepaystack);
          setForceUpdate(res.forceUpdate);
          setDiscoverShops(res.discovershops);
        }
      } catch (err) {
        notifyError(err?.response?.data?.message || err?.message);
      }
    })();
  }, []);

  return {
    errors,
    register,
    isSave,
    isSubmitting,
    onSubmit,
    handleSubmit,
    setForceUpdate,
    forceUpdate,
    paystack,
    stripe,
    setStripe,
    setPaystack,
    setDiscoverShops,
    discovershops,
    verifyemail, setVerifyEmail,
    setFlutterWave,
    flutterwave
  };
};

export default useSettingSubmit;
