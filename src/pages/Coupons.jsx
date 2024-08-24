import {
  Button,
  Card,
  CardBody,
  Input,
  Pagination,
  Table,
  TableCell,
  TableContainer,
  TableFooter,
  TableHeader,
  Select,
} from "@windmill/react-ui";
import { useContext, useEffect, useState } from "react";
import { FiEdit, FiPlus, FiTrash2 } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import SelectCategory from "@/components/form/selectOption/SelectOption";

//internal import
import { SidebarContext } from "@/context/SidebarContext";
import CouponServices from "@/services/CouponServices";
import useAsync from "@/hooks/useAsync";
import useToggleDrawer from "@/hooks/useToggleDrawer";
import useFilter from "@/hooks/useFilter";
import PageTitle from "@/components/Typography/PageTitle";
import DeleteModal from "@/components/modal/DeleteModal";
import BulkActionDrawer from "@/components/drawer/BulkActionDrawer";
import MainDrawer from "@/components/drawer/MainDrawer";
import CouponDrawer from "@/components/drawer/CouponDrawer";
import TableLoading from "@/components/preloader/TableLoading";
import CheckBox from "@/components/form/others/CheckBox";
import CouponTable from "@/components/coupon/CouponTable";
import NotFound from "@/components/table/NotFound";
import UploadManyTwo from "@/components/common/UploadManyTwo";

const Coupons = () => {
  const { t } = useTranslation();
  const { lang, status, setStatus, type, setType,currentPage,
    handleChangePage,
    resultsPerPage, } = useContext(SidebarContext);
  const { data, loading, error } = useAsync(() =>
    CouponServices.getAllCoupons(status,type,currentPage,)
  );
  const [isCheckAll, setIsCheckAll] = useState(false);
  const [isCheck, setIsCheck] = useState([]);

  const { allId, serviceId } = useToggleDrawer();

  const {
    couponRef,
    dataTable,
    serviceData,
    totalResults,
    setSearchCoupon,
    handleSubmitCoupon,
  } = useFilter(data);


  const handleSelectAll = () => {
    setIsCheckAll(!isCheckAll);
    setIsCheck(data?.map((li) => li._id));
    if (isCheckAll) {
      setIsCheck([]);
    }
  };

  // handle reset field function
  const handleResetField = () => {
    setSearchCoupon("");
    couponRef.current.value = "";
  };

  return (
    <>
      <PageTitle>Subscriptions</PageTitle>
      <DeleteModal
        ids={allId}
        setIsCheck={setIsCheck}
        title="Selected Coupon"
      />
      <BulkActionDrawer ids={allId} title="Coupons" />

      <MainDrawer>
        <CouponDrawer id={serviceId} />
      </MainDrawer>

      <Card className="min-w-0 shadow-xs overflow-hidden bg-white dark:bg-gray-800 mb-5">
        <CardBody>
          <form
            onSubmit={handleSubmitCoupon}
            className="py-3 grid gap-4 lg:gap-6 xl:gap-6 md:flex xl:flex"
          >
            <div className="flex-grow-0 md:flex-grow lg:flex-grow xl:flex-grow">
              <Input
                ref={couponRef}
                type="search"
                placeholder="search by shop name"
              />
            </div>
            <div className="flex-grow-0 md:flex-grow lg:flex-grow xl:flex-grow">
              <Select onChange={(e) => setType(e.target.value)}>
                <option value="type" defaultValue hidden>
                  Select Type
                </option>
                <option value="trial">Trial Period</option>
                <option value="production">Production</option>
              </Select>
            </div>
            <div className="flex-grow-0 md:flex-grow lg:flex-grow xl:flex-grow">
              <Select onChange={(e) => setStatus(e.target.value)}>
                <option value="Status" defaultValue hidden>
                  {t("Status")}
                </option>
                <option value="Active">Active</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Expired">Expired</option>
              </Select>
            </div>
            <div className="flex items-center gap-2 flex-grow-0 md:flex-grow lg:flex-grow xl:flex-grow">
              <div className="w-full mx-1">
                <Button type="submit" className="h-12 w-full bg-emerald-700">
                  Filter
                </Button>
              </div>

              <div className="w-full mx-1">
                <Button
                  layout="outline"
                  onClick={handleResetField}
                  type="reset"
                  className="px-4 md:py-1 py-2 h-12 text-sm dark:bg-gray-700"
                >
                  <span className="text-black dark:text-gray-200">Reset</span>
                </Button>
              </div>
            </div>
          </form>
        </CardBody>
      </Card>

      {loading ? (
        <TableLoading row={12} col={8} width={140} height={20} />
      ) : error ? (
        <span className="text-center mx-auto text-red-500">{error}</span>
      ) : serviceData?.length !== 0 ? (
        <TableContainer className="mb-8">
          <Table>
            <TableHeader>
              <tr>
                <TableCell>
                  <CheckBox
                    type="checkbox"
                    name="selectAll"
                    id="selectAll"
                    handleClick={handleSelectAll}
                    isChecked={isCheckAll}
                  />
                </TableCell>
                <TableCell>Shop Name</TableCell>
                <TableCell>Subscription Name</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Duration</TableCell>

                <TableCell>{t("CoupTblStartDate")}</TableCell>
                <TableCell>{t("CoupTblEndDate")}</TableCell>
                <TableCell>{t("CoupTblStatus")}</TableCell>
                <TableCell className="text-right">
                  {t("CoupTblActions")}
                </TableCell>
              </tr>
            </TableHeader>
            <CouponTable
              lang={lang}
              isCheck={isCheck}
              coupons={dataTable}
              setIsCheck={setIsCheck}
            />
          </Table>
          <TableFooter>
            <Pagination
              totalResults={data?.count}
              resultsPerPage={resultsPerPage}
              onChange={handleChangePage}
              label="Table navigation"
            />
          </TableFooter>
        </TableContainer>
      ) : (
        <NotFound title="Sorry, There are no coupons right now." />
      )}
    </>
  );
};

export default Coupons;
