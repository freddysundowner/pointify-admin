import {
  Avatar,
  Badge,
  TableBody,
  TableCell,
  TableRow,
} from "@windmill/react-ui";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

//internal import
import useUtilsFunction from "@/hooks/useUtilsFunction";
import CheckBox from "@/components/form/others/CheckBox";
import useToggleDrawer from "@/hooks/useToggleDrawer";
import DeleteModal from "@/components/modal/DeleteModal";
import MainDrawer from "@/components/drawer/MainDrawer";
import CouponDrawer from "@/components/drawer/SubscriptionDrawer";
import ShowHideButton from "@/components/table/ShowHideButton";
import EditDeleteButton from "@/components/table/EditDeleteButton";
import PackageDrawer from "../drawer/PackageDrawer";

const PackageTable = ({ isCheck, coupons, setIsCheck }) => {
  const [updatedCoupons, setUpdatedCoupons] = useState([]);

  const { title, serviceId, handleModalOpen, handleUpdate } = useToggleDrawer();

  const { currency, showDateTimeFormat, globalSetting, showingTranslateValue } =
    useUtilsFunction();

  const handleClick = (e) => {
    const { id, checked } = e.target;
    setIsCheck([...isCheck, id]);
    if (!checked) {
      setIsCheck(isCheck.filter((item) => item !== id));
    }
  };

  useEffect(() => {
    const result = coupons?.map((el) => {
      const newDate = new Date(el?.updatedAt).toLocaleString("en-US", {
        timeZone: globalSetting?.default_time_zone,
      });
      const newObj = {
        ...el,
        updatedDate: newDate,
      };
      return newObj;
    });
    setUpdatedCoupons(result);
  }, [coupons, globalSetting?.default_time_zone]);

  return (
    <>
      {isCheck.length < 1 && <DeleteModal id={serviceId} title={title} />}

      {isCheck.length < 2 && (
        <MainDrawer>
          <PackageDrawer id={serviceId} />
        </MainDrawer>
      )}

      <TableBody>
        {updatedCoupons?.map((coupon, i) => (
          <TableRow key={i + 1}>
            <TableCell>
              <CheckBox
                type="checkbox"
                name={coupon?.title?.en}
                id={coupon._id}
                handleClick={handleClick}
                isChecked={isCheck?.includes(coupon._id)}
              />
            </TableCell>

            <TableCell>
              <div className="flex items-center">
                <div>
                  <span className="text-sm">
                    {showingTranslateValue(coupon?.title)}
                  </span>{" "}
                </div>
              </div>{" "}
            </TableCell>
            <TableCell>
              <div className="flex items-center">
                <div>
                  <span className="text-sm">
                    KES {showingTranslateValue(coupon?.amount)}<br/>
                    USD {showingTranslateValue(coupon?.amountusd)}
                  </span>{" "}
                </div>
              </div>{" "}
            </TableCell> 

            <TableCell>
              {" "}
              <span className="text-sm">
                {" "}
                {coupon.durationValue} - {coupon.durationUnit}
              </span>{" "}
            </TableCell>

            <TableCell>
              <span className="text-sm">{coupon.discount}</span>
            </TableCell>

            <TableCell>
              <span className="text-sm">{coupon.type}</span>
            </TableCell>

            <TableCell className="align-middle ">
              {coupon.status == true ? (
                <Badge type="success">Active</Badge>
              ) : (
                <Badge type="danger">Inactive</Badge>
              )}
            </TableCell>

            <TableCell>
              <EditDeleteButton
                id={coupon?._id}
                isCheck={isCheck}
                handleUpdate={handleUpdate}
                handleModalOpen={handleModalOpen}
                title={showingTranslateValue(coupon?.title)}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </>
  );
};

export default PackageTable;
