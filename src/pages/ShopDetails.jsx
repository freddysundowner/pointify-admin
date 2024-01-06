import {
  Badge,
  Pagination,
  Table,
  TableCell,
  TableContainer,
  TableFooter,
  TableHeader,
} from "@windmill/react-ui";
import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";
//internal import

import useAsync from "@/hooks/useAsync";
import useFilter from "@/hooks/useFilter";
import useProductSubmit from "@/hooks/useProductSubmit";
import useToggleDrawer from "@/hooks/useToggleDrawer";
import ProductServices from "@/services/ProductServices";
import useUtilsFunction from "@/hooks/useUtilsFunction";
import AttributeList from "@/components/attribute/AttributeList";
import MainDrawer from "@/components/drawer/MainDrawer";
import ProductDrawer from "@/components/drawer/ProductDrawer";
import Loading from "@/components/preloader/Loading";
import PageTitle from "@/components/Typography/PageTitle";
import { SidebarContext } from "@/context/SidebarContext";
import ShopServices from "@/services/ShopServices";

const ShopDetails = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const { handleUpdate } = useToggleDrawer();
  const { attribue } = useProductSubmit(id);
  const [variantTitle, setVariantTitle] = useState([]);
  const { lang } = useContext(SidebarContext);

  const { data, loading } = useAsync(() => ShopServices.getProductById(id));

  const { currency, showingTranslateValue, getNumberTwo, shopExpired } =
    useUtilsFunction();

  const { handleChangePage, totalResults, resultsPerPage, dataTable } =
    useFilter(data?.variants);
  // console.log('data',data)

  // useEffect(() => {
  //   if (!loading) {
  //     const res = Object.keys(Object.assign({}, ...data?.variants));

  //     const varTitle = attribue?.filter((att) =>
  //       // res.includes(att.title.replace(/[^a-zA-Z0-9]/g, ''))
  //       res.includes(att._id)
  //     );

  //     setVariantTitle(varTitle);
  //   }
  // }, [attribue, data?.variants, loading, lang]);

  console.log("product", data);

  return (
    <>
      <MainDrawer product>
        <ProductDrawer id={id} />
      </MainDrawer>

      <PageTitle>Shop Details</PageTitle>
      {loading ? (
        <Loading loading={loading} />
      ) : (
        <div className="inline-block overflow-y-auto h-full align-middle transition-all transform">
          <div className="flex flex-col lg:flex-row md:flex-row w-full overflow-hidden">
            <div className="w-full flex flex-col p-5 md:p-8 text-left">
              <div className="mb-5 block ">
                <div className="font-serif font-semibold py-1 text-sm">
                  <p className="text-sm text-gray-500 pr-4">
                    {shopExpired(data.subscription?.endDate) == true ? (
                      <Badge type="success">Active</Badge>
                    ) : (
                      <Badge type="danger">Expired</Badge>
                    )}
                  </p>
                </div>
                <h2 className="text-heading text-lg md:text-xl lg:text-2xl font-semibold font-serif dark:text-gray-400">
                  {data?.name}
                </h2>
                <p className="font-serif font-medium text-gray-500 dark:text-gray-400 text-sm">
                  {t("Location")} :{" "}
                  <span className="font-bold text-gray-500 dark:text-gray-500">
                    {data?.address}
                    {data?.backupemail}
                  </span>
                </p>
                <p className="font-serif font-medium text-gray-500 dark:text-gray-400 text-sm">
                  {t("Backup Email: ")} :{" "}
                  <span className="font-bold text-gray-500 dark:text-gray-500">
                    {data?.backupemail}
                  </span>
                </p>
                <p className="font-serif font-medium text-gray-500 dark:text-gray-400 text-sm">
                  {t("Allowed Backup: ")} :{" "}
                  <span className="font-bold text-gray-500 dark:text-gray-500">
                    {data?.allowBackup == true ? "Yes" : "No"}{" "}
                    {data?.backupInterval}
                  </span>
                </p>
                <p className="font-serif font-medium text-gray-500 dark:text-gray-400 text-sm">
                  {t("Online selling: ")} :{" "}
                  <span className="font-bold text-gray-500 dark:text-gray-500">
                    {data?.allowOnlineSelling == true ? "Yes" : "No"}
                  </span>
                </p>
                <p className="font-serif font-medium text-gray-500 dark:text-gray-400 text-sm">
                  {t("Currency: ")} :{" "}
                  <span className="font-bold text-gray-500 dark:text-gray-500">
                    {data?.currency}
                  </span>
                </p>
              </div>
              <p className="text-sm leading-6 text-gray-500 dark:text-gray-400 md:leading-7">
                {showingTranslateValue(data?.description)}
              </p>
              <div className="flex flex-col mt-4">
                <p className="font-serif font-semibold py-1 text-gray-500 text-sm">
                  <span className="text-gray-700 dark:text-gray-400">
                    {t("Category")}:{" "}
                  </span>{" "}
                  {showingTranslateValue(data?.shopCategoryId?.name)}
                </p>
              </div>
              <div className="mt-6">
                <button
                  onClick={() => handleUpdate(id)}
                  className="cursor-pointer leading-5 transition-colors duration-150 font-medium text-sm focus:outline-none px-5 py-2 rounded-md text-white bg-emerald-500 border border-transparent active:bg-emerald-600 hover:bg-emerald-600 "
                >
                  {t("Edit Shop")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ShopDetails;
