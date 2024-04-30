import {
  TableBody,
  TableCell,
  TableRow,
} from "@windmill/react-ui";
import { Link } from "react-router-dom";
import Tooltip from "@/components/tooltip/Tooltip";
import { FiZoomIn } from "react-icons/fi"; 
//internal import
import MainDrawer from "@/components/drawer/MainDrawer";
import CheckBox from "@/components/form/others/CheckBox";
import DeleteModal from "@/components/modal/DeleteModal";
import EditDeleteButton from "@/components/table/EditDeleteButton";
import ShowHideButton from "@/components/table/ShowHideButton";
import useToggleDrawer from "@/hooks/useToggleDrawer";
import useUtilsFunction from "@/hooks/useUtilsFunction";
import PartnersDrawer from "../drawer/PartnersDrawer";
import { t } from "i18next";

//internal import

const PartnersTable = ({ partners, isCheck, setIsCheck }) => {
  const { title, serviceId, handleModalOpen, handleUpdate } = useToggleDrawer();
  const { currency, showingTranslateValue, getNumberTwo } = useUtilsFunction();

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
          <PartnersDrawer currency={currency} id={serviceId} />
        </MainDrawer>
      )}

      <TableBody>
        {partners?.map((partner, i) => (
          <TableRow key={i + 1}>
            <TableCell>
              <CheckBox
                type="checkbox"
                name={partner?.name}
                id={partner._id}
                handleClick={handleClick}
                isChecked={isCheck?.includes(partner._id)}
              />
            </TableCell>

            <TableCell>
              <div className="flex items-center">
                <div>
                  <h2>
                    {partner?.name}<br/>
                    {partner?.email}<br/>
                    {partner?.phonenumber}
                  </h2>
                </div>
              </div>
            </TableCell>

            <TableCell>
              <span className="text-sm">
                {partner?.code}
              </span>
            </TableCell>

            <TableCell>
              <span className="text-sm font-semibold">
                {partner?.wallet}
              </span>
            </TableCell>

            <TableCell>
              <span className="text-sm font-semibold">
                {partner?.admins?.length}
              </span>
            </TableCell>

            <TableCell>
              <Link
                to={`/shops/partner/${partner._id}`}
              className="flex justify-center text-gray-400 hover:text-emerald-600"
            >
              <span className="text-sm">{partner?.shops?.length}</span>
            </Link>
            </TableCell>

            <TableCell>
              <Link
                to={`/partner/${partner._id}`}
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
                id={partner._id}
                type={"blocked"}
                status={!partner.blocked}
              />
            </TableCell>
            <TableCell>
              <EditDeleteButton
                id={partner._id}
                partner={partner}
                isCheck={isCheck}
                handleUpdate={handleUpdate}
                handleModalOpen={handleModalOpen}
                title={showingTranslateValue(partner?.title)}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </>
  );
};

export default PartnersTable;
