import {
  Avatar,
  Badge,
  TableBody,
  TableCell,
  TableRow,
} from "@windmill/react-ui";
import { t } from "i18next";
import { FiZoomIn } from "react-icons/fi";
import { Link } from "react-router-dom";

//internal import
import MainDrawer from "@/components/drawer/MainDrawer";
import ProductDrawer from "@/components/drawer/ProductDrawer";
import CheckBox from "@/components/form/others/CheckBox";
import DeleteModal from "@/components/modal/DeleteModal";
import EditDeleteButton from "@/components/table/EditDeleteButton";
import ShowHideButton from "@/components/table/ShowHideButton";
import Tooltip from "@/components/tooltip/Tooltip";
import useToggleDrawer from "@/hooks/useToggleDrawer";
import useUtilsFunction from "@/hooks/useUtilsFunction";
import ShopDrawer from "../drawer/ShopDrawer";

//internal import

const ShopTable = ({ products, isCheck, setIsCheck }) => {
  const { title, serviceId, handleModalOpen, handleUpdate } = useToggleDrawer();
  const {
    currency,
    showingTranslateValue,
    getNumberTwo,
    showDateTimeFormat,
    shopExpired,
  } = useUtilsFunction();

  const handleClick = (e) => {
    const { id, checked } = e.target;
    // console.log("id", id, checked);

    setIsCheck([...isCheck, id]);
    if (!checked) {
      setIsCheck(isCheck.filter((item) => item !== id));
    }
  };

  return (
    <>
      {isCheck?.length < 1 && <DeleteModal id={serviceId} title={title} />}

      {isCheck?.length < 2 && (
        <MainDrawer>
          <ShopDrawer currency={currency} id={serviceId} />
        </MainDrawer>
      )}

      <TableBody>
        {products?.map((product, i) => (
          <TableRow key={i + 1}>
            <TableCell>
              <CheckBox
                type="checkbox"
                name={product?.name}
                id={product._id}
                handleClick={handleClick}
                isChecked={isCheck?.includes(product._id)}
              />
            </TableCell>

            <TableCell>
              <div className="flex items-center">
                <div>
                  <h2
                    className={`text-sm font-medium ${product?.name.length > 30 ? "wrap-long-title" : ""
                      }`}
                  >
                    {showingTranslateValue(product?.name)?.substring(0, 28)}<br/>
                    <p>Category: {showingTranslateValue(product?.shopCategoryId?.name)}<br /></p>
                    <p>Products: <span className="text-sm">{product.productCount}</span></p>
                  </h2>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <span className="text-sm"><p>{product.adminId?.username}</p><p className=" text-[12px]">{product.adminId?.phone}</p></span>
            </TableCell>
            <TableCell>
              <span className="text-[11px]"><p>{product.address}</p></span>
            </TableCell>
            <TableCell>
              <span className="text-sm">
                {showDateTimeFormat(product.subscription.endDate)}
              </span>
            </TableCell>
            <TableCell>
              {shopExpired(product.subscription.endDate) == true ? (
                <Badge type="success">Active</Badge>
              ) : (
                <Badge type="danger">Expired</Badge>
              )}
            </TableCell>
            <TableCell>
              <span className="text-sm">
                {product.subscription.packageId.type}(
                {product.subscription.packageId.durationValue}-
                {product.subscription.packageId.durationUnit})
              </span>
            </TableCell>
            <TableCell>
              <Link
                to={`/shop/${product._id}`}
                className="flex justify-center text-gray-400 hover:text-emerald-600"
              >
                <Tooltip
                  id="view"
                  Icon={FiZoomIn}
                  title={t("DetailsTbl")}
                  bgColor="#10B981"
                />
              </Link>
            </TableCell>
            <TableCell className="text-center">
              <ShowHideButton
                id={product._id}
                status={product.deleted == true ? "hide" : "show"}
              />
              {/* {product.status} */}
            </TableCell>
            <TableCell>
              <EditDeleteButton
                id={product._id}
                product={product}
                isCheck={isCheck}
                handleUpdate={handleUpdate}
                handleModalOpen={handleModalOpen}
                title={showingTranslateValue(product?.title)}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </>
  );
};

export default ShopTable;
