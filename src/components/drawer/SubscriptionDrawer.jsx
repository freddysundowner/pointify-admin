import { Input, Select, Textarea } from "@windmill/react-ui";
import { t } from "i18next";
import { Scrollbars } from "react-custom-scrollbars-2";

// internal imports
import Title from "@/components/form/others/Title";
import Error from "@/components/form/others/Error";
import LabelArea from "@/components/form/selectOption/LabelArea";
import DrawerButton from "@/components/form/button/DrawerButton";
import useSubscriptionSubmit from "@/hooks/useSubscriptionSubmit";
import SwitchToggle from "@/components/form/switch/SwitchToggle";
import { useEffect, useState } from "react";
import PackageServices from "@/services/PackagesServices";
import ShopServices from "@/services/ShopServices";
import useToggleDrawer from "@/hooks/useToggleDrawer";

const SubscriptionDrawer = ({ id }) => {
  const {
    register,
    handleSubmit,
    onSubmit,
    errors,
    isSubmitting,
    setValue,
    watch,
  } = useSubscriptionSubmit(id);

  const [packages, setPackages] = useState([]);
  const [shops, setShops] = useState([]);
  const { userId } = useToggleDrawer();
  console.log("id", userId);

  useEffect(() => {
    const fetchData = async () => {
      console.log("fetchData",userId);
      try {
        const [pkgRes, shopRes] = await Promise.all([
          PackageServices.getAllCoupons(),
          ShopServices.getAllShops({
            page: 1,
            limit: 20,
            category: '',
            locationText: '',
            title: '',
            price: '',
            userid: userId
          })
        ]);
        setPackages(pkgRes?.data || []);
        setShops(shopRes?.data || []);
      } catch (err) {
        console.error("Error loading select data", err);
      }
    };
    fetchData();
  }, [userId]);

  const selectedShops = watch("shops") || [];

  return (
    <>
      <div className="w-full relative p-6 border-b border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
        <Title
          title={id ? "Update Subscription" : t("AddSubscription")}
          description={!id ? t("AddSubscriptionDescription") : ""}
        />
      </div>

      <Scrollbars className="w-full md:w-7/12 lg:w-8/12 xl:w-8/12 relative dark:bg-gray-700 dark:text-gray-200">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="px-6 pt-8 flex-grow scrollbar-hide w-full max-h-full pb-40 grid gap-6">

            {/* Amount */}
            <div className="grid grid-cols-6 gap-4">
              <LabelArea label="Amount (KES)" />
              <div className="col-span-4">
                <Input
                  {...register("amount", { required: "Amount is required" })}
                  name="amount"
                  type="number"
                  step="any"
                  placeholder="Enter amount"
                />
                <Error errorName={errors.amount} />
              </div>
            </div>

            {/* Start Date */}
            <div className="grid grid-cols-6 gap-4">
              <LabelArea label="Start Date" />
              <div className="col-span-4">
                <Input
                  {...register("startDate", { required: "Start date is required" })}
                  name="startDate"
                  type="datetime-local"
                />
                <Error errorName={errors.startDate} />
              </div>
            </div>

            {/* End Date */}
            <div className="grid grid-cols-6 gap-4">
              <LabelArea label="End Date" />
              <div className="col-span-4">
                <Input
                  {...register("endDate", { required: "End date is required" })}
                  name="endDate"
                  type="datetime-local"
                />
                <Error errorName={errors.endDate} />
              </div>
            </div>

            {/* Package */}
            <div className="grid grid-cols-6 gap-4">
              <LabelArea label="Package" />
              <div className="col-span-4">
                <Select {...register("packageId._id", { required: "Package is required" })}>
                  <option value="">Select a Package</option>
                  {packages.map((pkg) => (
                    <option key={pkg._id} value={pkg._id}>
                      {pkg.title}
                    </option>
                  ))}
                </Select>
                <Error errorName={errors.packageId?._id} />
              </div>
            </div>

            {/* Shops (Multi-select) */}
            <div className="grid grid-cols-6 gap-4">
              <LabelArea label="Shops" />
              <div className="col-span-4">
                <Select
                  multiple
                  {...register("shops", { required: "Select at least one shop" })}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, (option) => option.value);
                    setValue("shops", selected);
                  }}
                  value={selectedShops}
                >
                  {shops.map((shop) => (
                    <option key={shop._id} value={shop._id}>
                      {shop.name}
                    </option>
                  ))}
                </Select>
                <Error errorName={errors.shops} />
              </div>
            </div>

            {/* Paid */}
            <div className="grid grid-cols-6 gap-4">
              <LabelArea label="Payment Status" />
              <div className="col-span-4">
                <SwitchToggle
                  name="paid"
                  register={register}
                  defaultChecked={watch("paid")}
                />
              </div>
            </div>

            {/* Status */}
            <div className="grid grid-cols-6 gap-4">
              <LabelArea label="Active Status" />
              <div className="col-span-4">
                <SwitchToggle
                  name="status"
                  register={register}
                  defaultChecked={watch("status")}
                />
              </div>
            </div>
          </div>

          <DrawerButton id={id} title="Subscription" isSubmitting={isSubmitting} />
        </form>
      </Scrollbars>
    </>
  );
};

export default SubscriptionDrawer;
