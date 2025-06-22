import dayjs from "dayjs";
import { useParams } from "react-router";
import ReactToPrint from "react-to-print";
import React, { useContext, useRef, useState } from "react";
import { SidebarContext } from "@/context/SidebarContext";
import {
  TableCell,
  TableHeader,
  Table,
  TableContainer,
  WindmillContext, TableFooter, Pagination
} from "@windmill/react-ui";
import { useTranslation } from "react-i18next";
import { PDFDownloadLink } from "@react-pdf/renderer";

//internal import
import useAsync from "@/hooks/useAsync";
import Status from "@/components/table/Status";
import OrderServices from "@/services/OrderServices";
import Invoice from "@/components/invoice/Invoice";
import Loading from "@/components/preloader/Loading";
import logoDark from "@/assets/img/logo/logo-dark.svg";
import logoLight from "@/assets/img/logo/logo-color.svg";
import PageTitle from "@/components/Typography/PageTitle";
import useUtilsFunction from "@/hooks/useUtilsFunction";
import InvoiceForDownload from "@/components/invoice/InvoiceForDownload";
import PartnersServices from "@/services/PartnersServices";
import NotFound from "./404";
import CouponServices from "@/services/SubscriptionServices";
import CheckBox from "@/components/form/others/CheckBox";
import EarningsTable from "@/components/partners/EarningsTable";
import useFilter from "@/hooks/useFilter";
import TransactionsTable from "@/components/partners/TransactionsTable";

const PartnerDetails = () => {
  const { t } = useTranslation();
  const { mode } = useContext(WindmillContext);
  const [isCheck, setIsCheck] = useState([]);
  const { id } = useParams();
  const printRef = useRef();
  const { lang, status, setStatus, type, setType,currentPage,
    handleChangePage,
    resultsPerPage, } = useContext(SidebarContext);
  const { data: earnings} = useAsync(() =>
    CouponServices.getEarnings(id,currentPage)
  );
  const { data: transactions} = useAsync(() =>
    CouponServices.getTransactions(id)
  );
  const { data, loading, error } = useAsync(() =>
    PartnersServices.getPartnerById(id)
  );
  console.log(earnings);
  const {
    dataTable,
    serviceData,
    totalResults,
  } = useFilter(earnings);

  console.log(transactions);

  const {
    currency,
    globalSetting,
    showDateTimeFormat,
    showDateFormat,
    getNumberTwo,
  } = useUtilsFunction();

  return (
    <>
      <PageTitle> Partner Profile </PageTitle>

      <div
        ref={printRef}
        className="bg-white dark:bg-gray-800 mb-4 p-6 lg:p-8 rounded-xl shadow-sm overflow-hidden"
      >
        {!loading && (
          <div className="">
            <div className="flex lg:flex-row md:flex-row flex-col lg:items-center justify-between pb-4 border-b border-gray-50 dark:border-gray-700 dark:text-gray-300">
              
              <div className="lg:text-right text-left">
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  {data?.name} <br />
                  {data?.email} <br />{" "}
                  <span> {data?.phonenumber} </span>
                </p>
              </div>
            </div>
            <div className="flex lg:flex-row md:flex-row flex-col justify-between pt-4">
              <div className="mb-3 md:mb-0 lg:mb-0 flex flex-col">
                <span className="font-bold font-serif text-sm uppercase text-gray-600 dark:text-gray-500 block">
                  {t("InvoiceDate")}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 block">
                  {showDateFormat(data?.createdAt)}
                </span>
              </div>
              <div className="mb-3 md:mb-0 lg:mb-0 flex flex-col">
                <span className="font-bold font-serif text-sm uppercase text-gray-600 dark:text-gray-500 block">
                  Total Earnings
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 block">
                  KES {data?.wallet}
                </span>
              </div>
              <div className="flex flex-col lg:text-right text-left">
                <span className="font-bold font-serif text-sm uppercase text-gray-600 dark:text-gray-500 block">
                  {t("InvoiceTo")}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 block">
                  {data?.customerId?.name} <br />
                  {data?.customerId?.email}{" "}
                  <span className="ml-2">{data?.customerId?.contact}</span>
                  <br />
                  {data?.customerId?.address?.substring(0, 30)}
                </span>
              </div>
            </div>
          </div>
        )}
        <div>
          <PageTitle> Earnings </PageTitle>
          {earnings?.length !== 0 ? (
          <TableContainer className="mb-8">
            <Table>
              <TableHeader>
                <tr>
                  <TableCell>
                    <CheckBox
                      type="checkbox"
                      name="selectAll"
                      id="selectAll"
                    />
                  </TableCell>
                  <TableCell>Shop Name</TableCell>
                  <TableCell>Earnings</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Mpesa Code</TableCell>
                </tr>
              </TableHeader>
              <EarningsTable
                isCheck={isCheck}
                coupons={dataTable}
                setIsCheck={setIsCheck}
              />
            </Table>
            <TableFooter>
              <Pagination
                totalResults={earnings?.count}
                resultsPerPage={resultsPerPage}
                onChange={handleChangePage}
                label="Table navigation"
              />
            </TableFooter>
          </TableContainer>
          ) : (
         <h2>No earnings yet</h2>
      )}

          <PageTitle> Transactions </PageTitle>
          {transactions?.length !== 0 ? (
          <TableContainer className="mb-8">
            <Table>
              <TableHeader>
                  <tr>
                    <TableCell>
                      <CheckBox
                        type="checkbox"
                        name="selectAll"
                        id="selectAll"
                      />
                    </TableCell>
                  <TableCell>Balance</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Mpesa Code</TableCell>
                  <TableCell>Mpesa Number</TableCell> 
                </tr>
              </TableHeader>
              <TransactionsTable
                isCheck={isCheck}
                  coupons={transactions}
                setIsCheck={setIsCheck}
              />
            </Table>
            <TableFooter>
              <Pagination
                  totalResults={transactions?.length}
                resultsPerPage={resultsPerPage}
                onChange={handleChangePage}
                label="Table navigation"
              />
            </TableFooter>
          </TableContainer>
          ) : (
          <NotFound title="Sorry, There are no coupons right now." />
      )}
        </div>

      </div>
    </>
  );
};

export default PartnerDetails;
