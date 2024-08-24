import { useTranslation } from "react-i18next";
import { Button } from "@windmill/react-ui";

//internal import

import Error from "@/components/form/others/Error";
import PageTitle from "@/components/Typography/PageTitle";
import useSettingSubmit from "@/hooks/useSettingSubmit";
import spinnerLoadingImage from "@/assets/img/spinner.gif";
import InputAreaTwo from "@/components/form/input/InputAreaTwo";
import SwitchToggle from "@/components/form/switch/SwitchToggle";

const Setting = () => {
  const {
    errors,
    register,
    isSave,
    isSubmitting,
    onSubmit,
    handleSubmit,
    setForceUpdate,
    forceUpdate,
    setStripe,
    stripe,
    setPaystack,
    paystack,
    setDiscoverShops,
    discovershops,
    setVerifyEmail,
    verifyemail,
    setFlutterWave,
    flutterwave
  } = useSettingSubmit();

  const { t } = useTranslation();

  return (
    <>
      <PageTitle>{t("Setting")}</PageTitle>
      <div className="sm:container md:p-6 p-4 w-full mx-auto bg-white  dark:bg-gray-800 dark:text-gray-200 rounded-lg">
        {import.meta.env.VITE_APP_DEMO === "true" ? (
          <h2>
            On demo mode you cannot view settings, please refer to the 
            <a
              style={{ color: "blue" }}
              href="https://doc.pointifypos.com/#admin-configuration"
              target="_blank"
            >
             {" "} documentation{" "}
            </a>
            to know what is here in this page{" "}
          </h2>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-12 font-sans">
              <div className="col-span-12 md:col-span-12 lg:col-span-12 mr-3">
                <div className="lg:px-6 pt-4 lg:pl-40 lg:pr-40 md:pl-5 md:pr-5 flex-grow scrollbar-hide w-full max-h-full pb-0">
                  <div className="grid md:grid-cols-5 items-center sm:grid-cols-12 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
                    <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1 sm:col-span-2">
                      {t("App Name")}
                    </label>
                    <div className=" sm:col-span-3">
                      <InputAreaTwo
                        required
                        register={register}
                        label="App Name"
                        name="appName"
                        type="text"
                        placeholder="App Name"
                      />
                      <Error errorName={errors.appName} />
                    </div>
                  </div>

                  <h1 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-4">
                    Payment Gateway Settings
                  </h1>

                  <h2 className="text-md font-bold text-gray-700 dark:text-gray-300 mb-4">
                    Stripe
                  </h2>
                  <div className="grid md:grid-cols-5 items-center sm:grid-cols-12 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
                    <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1 sm:col-span-2">
                      Allow Stripe
                    </label>
                    <div className="sm:col-span-3">
                      <SwitchToggle
                        handleProcess={setStripe}
                        processOption={stripe}
                      />
                      <Error errorName={errors.stripe} />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-5 items-center sm:grid-cols-12 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
                    <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1 sm:col-span-2">
                      {t("Stripe Secret Key")}
                    </label>
                    <div className=" sm:col-span-3">
                      <InputAreaTwo
                        required
                        register={register}
                        label="Stripe Secret Key"
                        name="stripe_secret_key"
                        type="text"
                        placeholder="Stripe Secret Key"
                      />
                      <Error errorName={errors.stripe_secret_key} />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-5 items-center sm:grid-cols-12 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
                    <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1 sm:col-span-2">
                      {t("Stripe Publishable Key")}
                    </label>
                    <div className=" sm:col-span-3">
                      <InputAreaTwo
                        required
                        register={register}
                        label="tripe Publishable Key"
                        name="stripe_publishable_key"
                        type="text"
                        placeholder="Stripe Publishable Key"
                      />
                      <Error errorName={errors.stripe_publishable_key} />
                    </div>
                  </div>
                  <h2 className="text-md font-bold text-gray-700 dark:text-gray-300 mb-4">
                    PayStack
                  </h2>
                  <div className="grid md:grid-cols-5 items-center sm:grid-cols-12 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
                    <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1 sm:col-span-2">
                      Allow Paystack
                    </label>
                    <div className="sm:col-span-3">
                      <SwitchToggle
                        handleProcess={setPaystack}
                        processOption={paystack}
                      />
                      <Error errorName={errors.paystack} />
                    </div>
                  </div>


                  <div className="grid md:grid-cols-5 items-center sm:grid-cols-12 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
                    <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1 sm:col-span-2">
                      {t("PayStack Secret Key")}
                    </label>
                    <div className=" sm:col-span-3">
                      <InputAreaTwo
                        required
                        register={register}
                        label="PayStack Secret Key"
                        name="paystack_secret_key"
                        type="text"
                        placeholder="PayStack Secret Key"
                      />
                      <Error errorName={errors.paystack_secret_key} />
                    </div>
                  </div>
                  <h2 className="text-md font-bold text-gray-700 dark:text-gray-300 mb-4">
                    FlutterWave
                  </h2>
                  <div className="grid md:grid-cols-5 items-center sm:grid-cols-12 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
                    <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1 sm:col-span-2">
                      Allow FlutterWave
                    </label>
                    <div className="sm:col-span-3">
                      <SwitchToggle
                        handleProcess={setFlutterWave}
                        processOption={flutterwave}
                      />
                    </div>
                  </div>


                  <div className="grid md:grid-cols-5 items-center sm:grid-cols-12 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
                    <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1 sm:col-span-2">
                      {t("FlutterWave Public Key")}
                    </label>
                    <div className=" sm:col-span-3">
                      <InputAreaTwo
                        required
                        register={register}
                        label="FlutterWave Key"
                        name="flutterwavekey"
                        type="text"
                        placeholder="FlutterWave Key"
                      />
                      <Error errorName={errors.flutterwavekey} />
                    </div>
                  </div>
                  <h2 className="text-md font-bold text-gray-700 dark:text-gray-300 mb-4">
                    Others
                  </h2>

                  <div className="grid md:grid-cols-5 items-center sm:grid-cols-12 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
                    <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1 sm:col-span-2">
                      Allow Shop Discovery
                    </label>
                    <div className="sm:col-span-3">
                      <SwitchToggle
                        handleProcess={setDiscoverShops}
                        processOption={discovershops}
                      />
                      <Error errorName={errors.discovershops} />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-5 items-center sm:grid-cols-12 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
                    <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1 sm:col-span-2">
                      {t("Google Api Key")}
                    </label>
                    <div className=" sm:col-span-3">
                      <InputAreaTwo
                        required
                        register={register}
                        label="Google Api Key"
                        name="google_api_key"
                        type="text"
                        placeholder="Google Api Key"
                      />
                      <Error errorName={errors.google_api_key} />
                    </div>
                  </div>
                  <h2 className="text-md font-bold text-gray-700 dark:text-gray-300 mb-4">
                    Email Settings
                  </h2>
                  <div className="grid md:grid-cols-5 items-center sm:grid-cols-12 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
                    <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1 sm:col-span-2">
                      {t("SMTP TYPE")}
                    </label>
                    <div className=" sm:col-span-3">
                      <InputAreaTwo
                        required
                        register={register}
                        label="SMTP TYPE"
                        name="SmtpType"
                        type="text"
                        placeholder="SMTP TYPE"
                      />
                      <Error errorName={errors.SmtpType} />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-5 items-center sm:grid-cols-12 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
                    <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1 sm:col-span-2">
                      {t("SMTP EMAIL")}
                    </label>
                    <div className=" sm:col-span-3">
                      <InputAreaTwo
                        required
                        register={register}
                        label="SMTPEMAIL"
                        name="SmtpEmail"
                        type="text"
                        placeholder="SMTP EMAIL"
                      />
                      <Error errorName={errors.SmtpEmail} />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-5 items-center sm:grid-cols-12 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
                    <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1 sm:col-span-2">
                      {t("SMTP PASSWORD")}
                    </label>
                    <div className=" sm:col-span-3">
                      <InputAreaTwo
                        required
                        register={register}
                        label="SMTP PASSWORD"
                        name="SmtpPassword"
                        type="text"
                        placeholder="SMTP PASSWORD"
                      />
                      <Error errorName={errors.SmtpPassword} />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-5 items-center sm:grid-cols-12 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
                    <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1 sm:col-span-2">
                      IOS version
                    </label>
                    <div className="sm:col-span-3">
                      <InputAreaTwo
                        register={register}
                        required
                        label="IOS version"
                        name="ios_version"
                        type="text"
                        placeholder="IOS version"
                      />
                      <Error errorName={errors.ios_version} />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-5 items-center sm:grid-cols-12 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
                    <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1 sm:col-span-2">
                      Demo Link
                    </label>
                    <div className="sm:col-span-3">
                      <InputAreaTwo
                        register={register}
                        required
                        label="Demo Link"
                        name="demolink"
                        type="text"
                        placeholder="Demo Link"
                      />
                      <Error errorName={errors.demolink} />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-5 items-center sm:grid-cols-12 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
                    <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1 sm:col-span-2">
                      Android version
                    </label>
                    <div className="sm:col-span-3">
                      <InputAreaTwo
                        register={register}
                        required
                        label="Android version"
                        name="android_version"
                        type="text"
                        placeholder="Android version"
                      />
                      <Error errorName={errors.android_version} />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-5 items-center sm:grid-cols-12 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
                    <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1 sm:col-span-2">
                      Force Update
                    </label>
                    <div className="sm:col-span-3">
                      <SwitchToggle
                        handleProcess={setForceUpdate}
                        processOption={forceUpdate}
                      />
                      <Error errorName={errors.forceUpdate} />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-5 items-center sm:grid-cols-12 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
                    <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1 sm:col-span-2">
                      {t("WebSite")}
                    </label>
                    <div className=" sm:col-span-3">
                      <InputAreaTwo
                        required
                        register={register}
                        label="Email"
                        name="website"
                        type="text"
                        placeholder="Web Site"
                      />
                      <Error errorName={errors.website} />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-5 items-center sm:grid-cols-12 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
                    <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1 sm:col-span-2">
                      Force Users to Verify Email Address
                    </label>
                    <div className="sm:col-span-3">
                      <SwitchToggle
                        handleProcess={setVerifyEmail}
                        processOption={verifyemail}
                      />
                      <Error errorName={errors.verifyemail} />
                    </div>
                  </div>
                  <div className="flex flex-row-reverse pb-6">
                    {isSubmitting ? (
                      <Button disabled={true} type="button" className="h-12">
                        <img
                          src={spinnerLoadingImage}
                          alt="Loading"
                          width={20}
                          height={10}
                        />{" "}
                        <span className="font-serif ml-2 font-light">
                          Processing
                        </span>
                      </Button>
                    ) : (
                      <Button type="submit" className="h-12 px-8">
                        {" "}
                        {isSave ? "Save" : "Update"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </>
  );
};
export default Setting;
