import { Input } from "@windmill/react-ui";
import { t } from "i18next";
import { Scrollbars } from "react-custom-scrollbars-2";

//internal import
import Title from "@/components/form/others/Title";
import Error from "@/components/form/others/Error";
import InputArea from "@/components/form/input/InputArea";
import InputValue from "@/components/form/input/InputValue";
import LabelArea from "@/components/form/selectOption/LabelArea";
import Uploader from "@/components/image-uploader/Uploader";
import useCouponSubmit from "@/hooks/useCouponSubmit";
import DrawerButton from "@/components/form/button/DrawerButton";
import SwitchToggle from "@/components/form/switch/SwitchToggle";
import SwitchToggleFour from "@/components/form/switch/SwitchToggleFour";
import Multiselect from "multiselect-react-dropdown";
import usePackagesSubmit from "@/hooks/usePackagesSubmit";

const PackageDrawer = ({ id }) => {
  const {
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
    setDiscountType,
    isSubmitting,
    resetRefTwo,
    handleSelectLanguage,
    setDefaultCategory,
    defaultCategory,
    selectedCategory,
  } = usePackagesSubmit(id);

  return (
    <>
      <div className="w-full relative  p-6 border-b border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 ">
        {id ? (
          <Title
            register={register}
            handleSelectLanguage={handleSelectLanguage}
            title={t("UpdateCoupon")}
            description={t("UpdateCouponDescription")}
          />
        ) : (
          <Title
            register={register}
            handleSelectLanguage={handleSelectLanguage}
            title={t("AddCoupon")}
            description={t("AddCouponDescription")}
          />
        )}
      </div>

      <Scrollbars className="w-full md:w-7/12 lg:w-8/12 xl:w-8/12 relative dark:bg-gray-700 dark:text-gray-200">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="px-6 pt-8 flex-grow scrollbar-hide w-full max-h-full pb-40">
            <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
              <LabelArea label="Package Name" />
              <div className="col-span-8 sm:col-span-4">
                <InputArea
                  register={register}
                  label="Coupon title"
                  name="title"
                  type="text"
                  placeholder="Package Name"
                />
                <Error errorName={errors.title} />
              </div>
            </div>

            <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
              <LabelArea label="Duration Value" />
              <div className="col-span-8 sm:col-span-4">
                <InputArea
                  register={register}
                  label="Duration Value"
                  name="durationValue"
                  type="text"
                  placeholder="Duration Value"
                />

                <Error errorName={errors.durationValue} />
              </div>
            </div>

            <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
              <LabelArea label="Duration Unit" />
              <div className="col-span-8 sm:col-span-4">
                <InputArea
                  register={register}
                  label="Duration Unit"
                  name="durationUnit"
                  type="text"
                  placeholder="Duration Unit"
                />

                <Error errorName={errors.durationUnit} />
              </div>
            </div>

            <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
              <LabelArea label="Discount" />
              <div className="col-span-8 sm:col-span-4">
                <InputValue
                  product
                  register={register}
                  maxValue={discountType ? 99 : 1000}
                  minValue={1}
                  label="Discount"
                  name="discount"
                  type="number"
                  placeholder="Discount"
                  currency={discountType ? "%" : currency}
                />

                <Error errorName={errors.discount} />
              </div>
            </div>

            <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
              <LabelArea label="Amount" />
              <div className="col-span-8 sm:col-span-4">
                <InputValue
                  product
                  register={register}
                  maxValue={discountType ? 99 : 1000}
                  minValue={1}
                  label="Amount"
                  name="amount"
                  type="number"
                  placeholder="Amount"
                  currency={discountType ? "%" : currency}
                />

                <Error errorName={errors.amount} />
              </div>
            </div>

            <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
              <LabelArea label={t("Published")} />
              <div className="col-span-8 sm:col-span-4">
                <SwitchToggle
                  handleProcess={setPublished}
                  processOption={published}
                />
                <Error errorName={errors.productType} />
              </div>
            </div>
          </div>

          <DrawerButton id={id} title="Coupon" isSubmitting={isSubmitting} />
        </form>
      </Scrollbars>
    </>
  );
};

export default PackageDrawer;
