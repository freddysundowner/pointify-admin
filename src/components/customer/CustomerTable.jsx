import { TableBody, TableCell, TableRow,
  Badge } from "@windmill/react-ui";
import dayjs from "dayjs";
import { t } from "i18next";
import React from "react";
import { FiZoomIn } from "react-icons/fi";
import { Link } from "react-router-dom";

//internal import

import MainDrawer from "@/components/drawer/MainDrawer";
import DeleteModal from "@/components/modal/DeleteModal";
import useToggleDrawer from "@/hooks/useToggleDrawer";
import Tooltip from "@/components/tooltip/Tooltip";
import CustomerDrawer from "@/components/drawer/CustomerDrawer";
import EditDeleteButton from "@/components/table/EditDeleteButton";

// internal imports

const CustomerTable = ({ customers }) => {
  const { title, serviceId, handleModalOpen, handleUpdate } = useToggleDrawer();

  return (
    <>
      <DeleteModal id={serviceId} title={title} />

      <MainDrawer>
        <CustomerDrawer id={serviceId} />
      </MainDrawer>

      <TableBody>
        {customers?.map((user) => (
          <TableRow key={user._id}>
            <TableCell>
              <span className="text-sm">
                {dayjs(user.createdAt).format("MMM D, YYYY H:mm")}
              </span> <br/>
              {/* <span className="text-sm font-medium">{user?.platform ==null ? "" : `Device: ${user?.platform} ~ ${user?.app_version ==null ? "" : user?.app_version}`}</span> */}
            </TableCell>
            <TableCell>
              <span className="text-sm">{user.username}</span><br/>
              {/* <span className="text-sm">{user.email} <Badge type={user?.emailVerified !=null  && user?.emailVerified ==true ? "success": "danger"}>{user?.emailVerified !=null  && user?.emailVerified ==true ? "Verified": "Unverified"}</Badge></span><br/> */}
              <span className="text-sm font-medium">{user.phone}</span>
            </TableCell>
            <TableCell>
              <Link
                to={`/products/${user?.primaryShop[0]?._id}`}
                className="flex text-blue-400 hover:text-emerald-600"
              >
                 <span className="text-sm">{user?.primaryShop[0]?.name}</span><br/>
              </Link>
             
              Refered By: <span className="text-sm">{user.referal?.username ?? "N/A"}</span>{" "}
            </TableCell>
            <TableCell>
              <span className="text-sm">{dayjs(user.last_seen).format("MMM D, YYYY H:mm")}</span>
            </TableCell>
            <TableCell>
              <Link
                to={`/shops/${user?._id}`}
                className="flex text-blue-400 hover:text-emerald-600"
              >
                 <span className="text-sm">{user?.shopCount}</span><br/>
              </Link>
            </TableCell>

            <TableCell>
              <div className="flex justify-end text-right">
                <div className="p-2 cursor-pointer text-gray-400 hover:text-emerald-600">
                  {" "}
                  <Link to={`/customer-order/${user._id}`}>
                    <Tooltip
                      id="view"
                      Icon={FiZoomIn}
                      title={t("ViewOrder")}
                      bgColor="#34D399"
                    />
                  </Link>
                </div>

                <EditDeleteButton
                  title={user.name}
                  id={user._id}
                  handleUpdate={handleUpdate}
                  handleModalOpen={handleModalOpen}
                />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </>
  );
};

export default CustomerTable;
