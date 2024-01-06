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
import CouponDrawer from "@/components/drawer/CouponDrawer";
import ShowHideButton from "@/components/table/ShowHideButton";
import EditDeleteButton from "@/components/table/EditDeleteButton";

const CouponTable = ({ isCheck, coupons, setIsCheck }) => {
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
          <CouponDrawer id={serviceId} />
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
                    {showingTranslateValue(coupon?.shop?.name)}
                  </span>{" "}
                </div>
              </div>{" "}
            </TableCell>
            <TableCell>
              <div className="flex items-center">
                <div>
                  <span className="text-sm">
                    {showingTranslateValue(coupon?.packageId?.title)}
                  </span>{" "}
                </div>
              </div>{" "}
            </TableCell>

            <TableCell>
              {" "}
              <span className="text-sm"> {coupon.packageId?.amount}</span>{" "}
            </TableCell>

            <TableCell>
              {" "}
              <span className="text-sm font-semibold">
                {coupon.packageId?.durationValue}{" "}
                {coupon.packageId?.durationUnit}
              </span>
            </TableCell>


            <TableCell>
              <span className="text-sm">
                {showDateTimeFormat(coupon.startDate)}
              </span>
            </TableCell>

            <TableCell>
              <span className="text-sm">
                {showDateTimeFormat(coupon.endDate)}
              </span>
            </TableCell>

            <TableCell className="align-middle ">
              {dayjs().isAfter(dayjs(coupon.endDate)) ? (
                <Badge type="danger">Expired</Badge>
              ) : (
                <Badge type="success">Active</Badge>
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

export default CouponTable;
