import { TableBody, TableCell, TableRow } from "@windmill/react-ui";

import { useTranslation } from "react-i18next";
import { FiZoomIn } from "react-icons/fi";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
//internal import

import Status from "@/components/table/Status";
import Tooltip from "@/components/tooltip/Tooltip";
import useUtilsFunction from "@/hooks/useUtilsFunction";
import PrintReceipt from "@/components/form/others/PrintReceipt";
import SelectStatus from "@/components/form/selectOption/SelectStatus";

const OrderTable = ({ orders }) => {
  // console.log('globalSetting',globalSetting)
  const { t } = useTranslation();
  const { showDateTimeFormat, currency, getNumberTwo } = useUtilsFunction();

  console.log('orders',orders)

  return (
    <>
      <TableBody className="dark:bg-gray-900">
        {orders?.map((order, i) => (
          <TableRow key={i + 1}>
            <TableCell>
              <span className="font-semibold uppercase text-xs">
                {order?.receiptNo}
              </span>
            </TableCell>

            <TableCell>
              <span className="text-sm">
                {dayjs(order.createdAt).format("MMM D, YYYY H:mm")}
              </span>
            </TableCell>

            <TableCell className="text-xs">
              Shop: <span className="text-sm">{order?.shopId?.name}</span>{" "}<br/>
              Attendant: <span className="text-sm">{order?.attendantId?.username}</span>{" "}<br />
              Location: <span className="text-sm">{order?.shopId?.address}</span>{" "}
            </TableCell>

            <TableCell>
              <span className="text-sm font-semibold">
                {order?.paymentType}
              </span>
            </TableCell>

            <TableCell>
              <span className="text-sm font-semibold">
                {order?.shopId?.currency}
                {getNumberTwo(order?.totalWithDiscount)}<br/>
                Items: {order.items?.length}
              </span>
            </TableCell>

            <TableCell className="text-xs">
              <Status status={order?.status} />
            </TableCell>

            <TableCell className="text-center">
              <SelectStatus id={order._id} order={order} />
            </TableCell>

            <TableCell className="text-right flex justify-end">
              <div className="flex justify-between items-center">
                <PrintReceipt orderId={order._id} />

                <span className="p-2 cursor-pointer text-gray-400 hover:text-emerald-600">
                  <Link to={`/order/${order._id}`}>
                    <Tooltip
                      id="view"
                      Icon={FiZoomIn}
                      title={t("ViewInvoice")}
                      bgColor="#059669"
                    />
                  </Link>
                </span>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </>
  );
};

export default OrderTable;
