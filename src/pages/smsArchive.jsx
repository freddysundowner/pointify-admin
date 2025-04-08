import React, { useContext, useState } from "react";
import {
  Table,
  TableHeader,
  TableCell,
  TableFooter,
  TableContainer,
  Select,
  Input,
  Button,
  Card,
  CardBody,
  Pagination,
} from "@windmill/react-ui";
import { useTranslation } from "react-i18next";
import useToggleDrawer from "@/hooks/useToggleDrawer";
import NotFound from "@/components/table/NotFound";
import PageTitle from "@/components/Typography/PageTitle";
import { SidebarContext } from "@/context/SidebarContext";
import ProductTable from "@/components/product/ProductTable";
import MainDrawer from "@/components/drawer/MainDrawer";
import ProductDrawer from "@/components/drawer/ProductDrawer";
import CheckBox from "@/components/form/others/CheckBox";
import useProductFilter from "@/hooks/useProductFilter";
import DeleteModal from "@/components/modal/DeleteModal";
import TableLoading from "@/components/preloader/TableLoading";
import useFilter from "@/hooks/useFilter";
import useCommunication from "@/hooks/useSms";

const SmsArchive = (props) => {
  const { title, allId, serviceId} =
    useToggleDrawer();

  const { t } = useTranslation();
  const {
    lang,
    setCategory,
    searchRef,
    handleSubmitForAll,
    setSortedField,
  } = useContext(SidebarContext);



  const { data } = useCommunication();
  const {
    handleChangePage,
    totalResults,
    resultsPerPage,dataTable
  } = useFilter(data);

  // react hooks
  const [isCheckAll, setIsCheckAll] = useState(false);
  const [isCheck, setIsCheck] = useState([]);

  const handleSelectAll = () => {
    setIsCheckAll(!isCheckAll);
    setIsCheck(data?.products.map((li) => li._id));
    if (isCheckAll) {
      setIsCheck([]);
    }
  };
  // handle reset field
  const handleResetField = () => {
    setCategory("");
    setSortedField("");
    searchRef.current.value = "";
  };
  const {
    serviceData,
    templates
  } = useCommunication(data);

  return (
    <>
      <PageTitle>All Sms</PageTitle>


      {templates?.length !== 0 ? (
        <TableContainer className="mb-8 rounded-b-lg">
          <Table>
            <TableHeader>
              <tr>
                <TableCell>
                  <CheckBox
                    type="checkbox"
                    name="selectAll"
                    id="selectAll"
                    isChecked={isCheckAll}
                    handleClick={handleSelectAll}
                  />
                </TableCell>
                <TableCell>{t("ProductNameTbl")}</TableCell>
                <TableCell>{t("CategoryTbl")}</TableCell>
                <TableCell>Buying Price</TableCell>
                <TableCell>Sale Price</TableCell>
                <TableCell>{t("StockTbl")}</TableCell>
                <TableCell>{t("StatusTbl")}</TableCell>
                <TableCell className="text-center">{t("DetailsTbl")}</TableCell>
                <TableCell className="text-center">
                  {t("PublishedTbl")}
                </TableCell>
                <TableCell className="text-right">{t("ActionsTbl")}</TableCell>
              </tr>
            </TableHeader>
           <TableBody>
        {products?.map((product, i) => (
          <TableRow key={i + 1}>
            <TableCell>
              <div className="flex items-center">
                <div>
                  <h2
                    className={`text-sm font-medium ${product?.name.length > 30 ? "wrap-long-title" : ""
                      }`}
                  >
                    {showingTranslateValue(product?.name)?.substring(0, 28)}
                  </h2>
                </div>
              </div>
            </TableCell>

            <TableCell>
              <span className="text-sm font-semibold">{product?.rate}%</span>
            </TableCell>

            <TableCell>
              <span className="text-sm font-semibold">
                {product?.interestType}
              </span>
            </TableCell>

            <TableCell>
              <span className="text-sm">{product.paymentPeriod}</span>
            </TableCell>
            <TableCell>{product.paymentFrequency}</TableCell>
            <TableCell>
              <Link
                to={`/charges/${product._id}`}
                className="p-2 cursor-pointer text-gray-400 hover:text-emerald-600 focus:outline-none"
              >
                <p className=" text-green-700">View Extra Charges</p>
              </Link>
            </TableCell>
            <TableCell>
              {/* <EditDeleteButton
                id={product._id}
                product={product}
                isCheck={isCheck}
                handleUpdate={handleUpdate}
                handleModalOpen={handleModalOpen}
                title={showingTranslateValue(product?.title)}
              /> */}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
          </Table>
          <TableFooter>
            <Pagination
              totalResults={totalResults}
              resultsPerPage={resultsPerPage}
              onChange={handleChangePage}
              label="Product Page Navigation"
            />
          </TableFooter>
        </TableContainer>
      ) : (
        <NotFound title="Product" />
      )}
    </>
  );
};

export default SmsArchive;
