import {
  Pagination,
  Table,
  TableCell,
  TableContainer,
  TableFooter,
  TableHeader,
  WindmillContext,
} from "@windmill/react-ui";
import { TableBody, TableRow } from "@windmill/react-ui";

import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import isToday from "dayjs/plugin/isToday";
import isYesterday from "dayjs/plugin/isYesterday";
import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FiCheck,
  FiRefreshCw,
  FiShoppingCart,
  FiTruck,
  FiEdit,
  FiZoomIn,
} from "react-icons/fi";
import { ImCreditCard, ImStack } from "react-icons/im";
import PrintReceipt from "@/components/form/others/PrintReceipt";
import { Link } from "react-router-dom";

//internal import
import useAsync from "@/hooks/useAsync";
import useFilter from "@/hooks/useFilter";
import LineChart from "@/components/chart/LineChart/LineChart";
import PieChart from "@/components/chart/Pie/PieChart";
import CardItem from "@/components/dashboard/CardItem";
import CardItemTwo from "@/components/dashboard/CardItemTwo";
import ChartCard from "@/components/chart/ChartCard";
import TableLoading from "@/components/preloader/TableLoading";
import NotFound from "@/components/table/NotFound";
import PageTitle from "@/components/Typography/PageTitle";
import { SidebarContext } from "@/context/SidebarContext";
import { AdminContext } from "@/context/AdminContext";

import DashboardService from "@/services/DashboardService";
import useUtilsFunction from "@/hooks/useUtilsFunction";
import Status from "@/components/table/Status";
import Tooltip from "@/components/tooltip/Tooltip";

const Dashboard = () => {
  const { t } = useTranslation();
  const { currency } = useUtilsFunction();
  const { mode } = useContext(WindmillContext);
  const { state } = useContext(AdminContext);
  const { adminInfo } = state;

  dayjs.extend(isBetween);
  dayjs.extend(isToday);
  dayjs.extend(isYesterday);

  const { currentPage, handleChangePage } = useContext(SidebarContext);
  const [salesReport, setSalesReport] = useState([]);

  const {
    data: recentTransactions,
    loading: loadingRecentTransactions,
    error,
  } = useAsync(DashboardService.getDashboardRecentTransactions);

  const { data: dashboardRecentPayments, loading: loadingRecentOrder } =
    useAsync(() =>
      DashboardService.getDashboardRecentPayments({
        page: currentPage,
        limit: 8,
      })
    );

  const { data: dashboardOrderCount, loading: loadingOrderCount } = useAsync(
    DashboardService.getDashboardCount
  );

  const { data: dashboardOrderAmount, loading: loadingOrderAmount } = useAsync(
    DashboardService.getDashboardAmount
  );


  const { dataTable, serviceData } = useFilter(
    dashboardRecentPayments?.payments
  );

  console.log(adminInfo?.permissions)
  return (
    <>
      <PageTitle>{t("DashboardOverview")}</PageTitle>

      {adminInfo?.permissions == "all" && <div className="grid gap-2 mb-8 xl:grid-cols-5 md:grid-cols-2">
        <CardItemTwo
          mode={mode}
          title="Today Subscriptions"
          title2="Today Subscriptions"
          data={
            dashboardOrderCount?.today?.length > 0
              ? dashboardOrderCount?.today
              : [
                {
                  amount: 0,
                  count: 0,
                },
                {
                  amount: 0,
                  count: 0,
                },
              ]
          }
          count={dashboardOrderAmount?.today?.subscriptionsCount || 0}
          Icon={ImStack}
          bigTotal={dashboardOrderAmount?.today?.amount || 0}
          leftTotal={dashboardOrderAmount?.today?.amount || 0}
          leftText="Applied"
          rightTotal={dashboardOrderAmount?.today?.amount || 0}
          rightText="Disbursed"
          className="text-white dark:text-emerald-100 bg-teal-600"
          loading={loadingOrderAmount}
        />

        <CardItemTwo
          mode={mode}
          title="Yesterday Subscriptions"
          title2="Yesterday Subscriptions"
          count={
            dashboardOrderAmount?.yesterday?.yesterdaysubscriptionsCount || 0
          }
          Icon={ImStack}
          data={
            dashboardOrderCount?.yesterday?.length > 0
              ? dashboardOrderCount?.yesterday
              : [
                {
                  amount: 0,
                  count: 0,
                },
                {
                  amount: 0,
                  count: 0,
                },
              ]
          }
          bigTotal={dashboardOrderAmount?.yesterday?.amount || 0}
          leftTotal={dashboardOrderAmount?.yesterday?.amount || 0}
          leftText="Applied"
          rightTotal={dashboardOrderAmount?.yesterday?.amount || 0}
          rightText="Disbursed"
          className="text-white dark:text-orange-100 bg-orange-400"
          loading={loadingOrderAmount}
        />

        <CardItemTwo
          mode={mode}
          title="This Week"
          title2="This Week"
          count={dashboardOrderAmount?.thisWeekSummary?.subscriptionsCount || 0}
          Icon={ImStack}
          data={
            dashboardOrderCount?.thisWeekSummary?.length > 0
              ? dashboardOrderCount?.thisWeekSummary
              : [
                {
                  amount: 0,
                  count: 0,
                },
                {
                  amount: 0,
                  count: 0,
                },
              ]
          }
          bigTotal={dashboardOrderAmount?.thisWeekSummary?.amount || 0}
          leftTotal={dashboardOrderAmount?.thisWeekSummary?.amount || 0}
          leftText="Applied"
          rightTotal={dashboardOrderAmount?.thisWeekSummary?.amount || 0}
          rightText="Disbursed"
          className="text-white dark:text-orange-100 bg-orange-400"
          loading={loadingOrderAmount}
        />

        <CardItemTwo
          mode={mode}
          title="Yesterday Subscriptions"
          title2="This Month Subscriptions"
          data={
            dashboardOrderCount?.thisMonth?.length > 0
              ? dashboardOrderCount?.thisMonth
              : [
                {
                  amount: 0,
                  count: 0,
                },
                {
                  amount: 0,
                  count: 0,
                },
              ]
          }
          count={dashboardOrderAmount?.thisMonth?.thisMonthSubscriptions || 0}
          Icon={FiShoppingCart}
          bigTotal={dashboardOrderAmount?.thisMonth?.thisMonthAmount || 0}
          className="text-white dark:text-emerald-100 bg-blue-500"
          loading={loadingOrderAmount}
        />

        <CardItemTwo
          mode={mode}
          title2="LastMonth"
          Icon={ImCreditCard}
          data={
            dashboardOrderCount?.lastMonth?.length > 0
              ? dashboardOrderCount?.lastMonth
              : [
                {
                  amount: 0,
                  count: 0,
                },
                {
                  amount: 0,
                  count: 0,
                },
              ]
          }
          loading={loadingOrderAmount}
          count={dashboardOrderAmount?.lastMonth?.lastMonthSubscriptions || 0}
          price={dashboardOrderAmount?.lastMonth?.lastMonthAmount || 0}
          className="text-white dark:text-teal-100 bg-cyan-600"
        />

        <CardItemTwo
          mode={mode}
          title2="All Time Subscriptions"
          Icon={ImCreditCard}
          data={
            dashboardOrderCount?.allTime?.length > 0
              ? dashboardOrderCount?.allTime
              : [
                {
                  amount: 0,
                  count: 0,
                },
                {
                  amount: 0,
                  count: 0,
                },
              ]
          }
          count={dashboardOrderAmount?.allTime?.allTimeSubscriptions || 0}
          price={dashboardOrderAmount?.allTime?.allTimeAmount || 0}
          className="text-white dark:text-emerald-100 bg-emerald-600"
          loading={loadingOrderAmount}
        />
      </div>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <CardItem
          title="All Users"
          Icon={FiShoppingCart}
          loading={loadingOrderCount}
          quantity={dashboardOrderCount?.totalUsers || 0}
          // amount={dashboardOrderCount?.all?.amount || 0}
          className="text-orange-600 dark:text-orange-100 bg-orange-100 dark:bg-orange-500"
        />
        <CardItem
          title="Total Shops"
          Icon={FiRefreshCw}
          smallContent={dashboardOrderCount.totalActiveShops}
          smallContentText="Active"
          loading={loadingOrderCount}
          quantity={dashboardOrderCount?.totalShops || 0}
          className="text-blue-600 dark:text-blue-100 bg-blue-100 dark:bg-blue-500"
        />
        <CardItem
          title="Active Subscriptions"
          Icon={FiTruck}
          smallContent={dashboardOrderCount.yearlySubscribers}
          smallContentText="Yearly"
          loading={loadingOrderCount}
          quantity={dashboardOrderCount?.activeCount || 0}
          className="text-teal-600 dark:text-teal-100 bg-teal-100 dark:bg-teal-500"
        />
        <CardItem
          title="Active Trials "
          Icon={FiCheck}
          smallContent={dashboardOrderCount.expiredCount}
          smallContentText="Expired"
          loading={loadingOrderCount}
          quantity={dashboardOrderCount?.trialCount || 0}
          className="text-emerald-600 dark:text-emerald-100 bg-emerald-100 dark:bg-emerald-500"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 my-8">
        <ChartCard
          mode={mode}
          // loading={loadingOrderAmount}
          title={t("Statistics Overview")}
        >
          <LineChart
            subscriptionReport={dashboardOrderCount?.subscriptionsByMonth}
            usersReport={dashboardOrderCount?.userRegistrations}
          />
        </ChartCard>

        <ChartCard
          mode={mode}
          // loading={loadingBestSellerProduct}
          title={`Total Active Shops ${
            dashboardOrderCount?.activeCount + dashboardOrderCount?.trialCount
          }`}
        >
          <PieChart
            data={{
              counts: [
                {
                  count:
                    (dashboardOrderCount?.trialCount /
                      (dashboardOrderCount?.activeCount +
                        dashboardOrderCount?.trialCount)) *
                    100,
                },
                {
                  count:
                    (dashboardOrderCount?.activeCount /
                      (dashboardOrderCount?.activeCount +
                        dashboardOrderCount?.trialCount)) *
                    100,
                },
              ],
              lables: [
                {
                  label: `Trial ${
                    (dashboardOrderCount?.trialCount /
                      (dashboardOrderCount?.activeCount +
                        dashboardOrderCount?.trialCount)) *
                    100
                  }`,
                },
                {
                  label: `Premium ${
                    (dashboardOrderCount?.activeCount /
                      (dashboardOrderCount?.activeCount +
                        dashboardOrderCount?.trialCount)) *
                    100
                  }%`,
                },
              ],
            }}
          />
        </ChartCard>
      </div>

      <PageTitle>Recently Subscribed</PageTitle>
      {dashboardOrderCount?.recentlySubscribedShops?.length !== 0 ? (
        <TableContainer className="mb-8">
          <Table>
            <TableHeader>
              <tr>
                <TableCell>Date</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Amount </TableCell>
                <TableCell>Transaction Id </TableCell>
                <TableCell>Active Untill</TableCell>
              </tr>
            </TableHeader>

            {dashboardOrderCount?.recentlySubscribedShops?.map(
              (transaction, i) => (
                <TableRow key={i + 1}>
                  <TableCell>
                    <span className="font-semibold uppercase text-xs">
                      {dayjs(
                        new Date(transaction?.subscriptionDetails[0]?.createAt)
                      ).format("MM/D/YYYY hh:mm A")}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold uppercase text-xs">
                      {transaction?.name}
                    </span>
                  </TableCell>

                  <TableCell>
                    <span className="text-sm">
                      {transaction?.currency}
                      {transaction?.subscriptionDetails[0]?.amount ??
                        transaction?.subscriptionDetails[0]?.package[0].amount}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      #{transaction?.subscriptionDetails[0]?.mpesaCode}
                    </span>
                  </TableCell>

                  <TableCell>
                    <span className="text-sm">
                      {dayjs(
                        new Date(transaction?.subscriptionDetails[0]?.startDate)
                      ).format("MM/D/YYYY")}
                    </span>{" "}
                    -
                    <span className="text-sm">
                      {" "}
                      {dayjs(
                        new Date(transaction?.subscriptionDetails[0]?.endDate)
                      ).format("MM/D/YYYY")}
                    </span>
                  </TableCell>
                </TableRow>
              )
            )}
          </Table>
          <TableFooter>
            <Pagination
              totalResults={
                dashboardOrderCount?.recentlySubscribedShops?.length
              }
              resultsPerPage={8}
              onChange={handleChangePage}
              label="Table navigation"
            />
          </TableFooter>
        </TableContainer>
      ) : (
        <NotFound title="Sorry, There are no orders right now." />
      )}
      {/*
      <PageTitle>Recent Payments</PageTitle>

      {loadingRecentOrder ? (
        <TableLoading row={5} col={4} />
      ) : serviceData?.length !== 0 ? (
        <TableContainer className="mb-8">
          <Table>
            <TableHeader>
              <tr>
                <TableCell>Date</TableCell>
                <TableCell>Member</TableCell>
                <TableCell>Amount </TableCell>
                <TableCell>Mpesa Code </TableCell>
                <TableCell>Type</TableCell>
              </tr>
            </TableHeader>

            {dataTable?.map((loan, i) => (
              <TableRow key={i + 1}>
                <TableCell>
                  <span className="font-semibold uppercase text-xs">
                    {dayjs(new Date(loan?.createdAt)).format(
                      "MM/D/YYYY hh:mm A"
                    )}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="font-semibold uppercase text-xs">
                    {loan?.member[0]?.first_name}
                  </span>
                </TableCell>

                <TableCell>
                  <span className="text-sm">
                    {currency}
                    {loan?.totalAmount}
                  </span>
                </TableCell>

                <TableCell className="text-xs">
                  <span className="text-sm">{loan?.mpesaCode}</span>{" "}
                </TableCell>

                <TableCell>
                  <span className="text-sm font-semibold">{loan?.type}</span>
                </TableCell>
              </TableRow>
            ))}
          </Table>
          <TableFooter>
            <Pagination
              totalResults={dashboardRecentPayments?.totalDocs}
              resultsPerPage={8}
              onChange={handleChangePage}
              label="Table navigation"
            />
          </TableFooter>
        </TableContainer>
      ) : (
        <NotFound title="Sorry, There are no orders right now." />
      )} */}
    </>
  );
};

export default Dashboard;
