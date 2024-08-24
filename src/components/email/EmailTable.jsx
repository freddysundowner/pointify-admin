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

//internal import

const EmailTable = ({ emails, isCheck, setIsCheck }) => {
  const { title, serviceId, handleModalOpen, handleUpdate } = useToggleDrawer();
  const { currency, showingTranslateValue, showDateTimeFormat } = useUtilsFunction();

  const handleClick = (e) => {
    const { id, checked } = e.target;
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
          <ProductDrawer currency={currency} id={serviceId} />
        </MainDrawer>
      )}

      <TableBody>
        {emails?.map((email, i) => (
          <TableRow key={i + 1}>
            <TableCell>
              <CheckBox
                type="checkbox"
                name={email?.name}
                id={email._id}
                handleClick={handleClick}
                isChecked={isCheck?.includes(email._id)}
              />
            </TableCell>

            <TableCell>
              <span className="text-sm">
                {showingTranslateValue(email?.subject)}
              </span>
            </TableCell>

            <TableCell>
              <span className="text-sm font-semibold">
                {email?.sentCount}
              </span>
            </TableCell>

            <TableCell>
              <span className="text-sm font-semibold">
                {showDateTimeFormat(email?.createAt)}
              </span>
            </TableCell>
            <TableCell>
              <span className="text-sm">{email.interval}</span>
            </TableCell>

            <TableCell>
              <span className="text-sm">{email.audience}</span>
            </TableCell>
            <TableCell>
              <ShowHideButton
                id={email._id}
                status={email.sheduled == true ? "show" : "hide"}
              />
            </TableCell>
            <TableCell>
              <EditDeleteButton
                id={email._id}
                email={email}
                handleUpdate={handleUpdate}
                handleModalOpen={handleModalOpen}
                title={showingTranslateValue(email?.name)}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </>
  );
};

export default EmailTable;
