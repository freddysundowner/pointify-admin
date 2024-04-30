import {
  Input,
} from "@windmill/react-ui";
import React from "react";
import { Scrollbars } from "react-custom-scrollbars-2";
import "react-responsive-modal/styles.css";
import { useTranslation } from "react-i18next";

//internal import

import Title from "@/components/form/others/Title";
import Error from "@/components/form/others/Error";
import InputArea from "@/components/form/input/InputArea";
import LabelArea from "@/components/form/selectOption/LabelArea";
import DrawerButton from "@/components/form/button/DrawerButton";
import usePartnerSubmit from "@/hooks/usePartnerSubmit";

//internal import

const PartnersDrawer = ({ id }) => {
  const { t } = useTranslation();

  const {
    register,
    onSubmit,
    errors,
    handleSubmit,
    isSubmitting,
  } = usePartnerSubmit(id);


  return (
    <>

      <div className="w-full relative p-6 border-b border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
        {id ? (
          <Title
            register={register}
            title={"Update"}
          />
        ) : (
          <Title
            register={register}
            title={"Add"}
          />
        )}
      </div>

      <Scrollbars className="track-horizontal thumb-horizontal w-full md:w-7/12 lg:w-8/12 xl:w-8/12 relative dark:bg-gray-700 dark:text-gray-200">
        <form onSubmit={handleSubmit(onSubmit)} className="block" id="block">
            <div className="px-6 pt-8 flex-grow w-full h-full max-h-full pb-40 md:pb-32 lg:pb-32 xl:pb-32">
              <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
                <LabelArea label="Name" />
                <div className="col-span-8 sm:col-span-4">
                  <Input
                    {...register(`name`, {
                      required: "Name is required!",
                    })}
                    name="name"
                    type="text"
                    placeholder="Name"
                  />
                  <Error errorName={errors.name} />
                </div>
              </div>

              <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
                <LabelArea label="Email" />
                <div className="col-span-8 sm:col-span-4">
                  <InputArea
                    register={register}
                    required="true"
                    label="email"
                    name="email"
                    type="text"
                    placeholder="Email"
                  />
                  <Error errorName={errors.email} />
                </div>
              </div>
              <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
                <LabelArea label="Phone" />
                <div className="col-span-8 sm:col-span-4">
                  <InputArea
                    register={register}
                    required="false"
                    label="phonenumber"
                    name="phonenumber"
                    type="text"
                    placeholder="Phone"
                  />
                  <Error errorName={errors.phonenumber} />
                </div>
              </div>
            </div>
          


           <DrawerButton id={id} title="Affliate" isSubmitting={isSubmitting} />

        </form>
      </Scrollbars>
    </>
  );
};

export default React.memo(PartnersDrawer);
