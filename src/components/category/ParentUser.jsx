import Multiselect from "multiselect-react-dropdown";
import useUtilsFunction from "@/hooks/useUtilsFunction";
import { useEffect, useState } from "react";

const ParentUser = ({
  selectedCategory,
  setSelectedCategory,
  setSearchedText,
  placeholder,
  members,
}) => {
  const { showingTranslateValue } = useUtilsFunction();
  const [membersData, setMembersData] = useState([]);
  useEffect(() => {
    let dd = [];
    members?.forEach((element) => {
      dd.push({
        name: element.username+" Phone: "+element.phone+" Email: "+element.email,
        _id: element._id,
        mpesaNumber: element.phone,
      });
    });
    setMembersData(dd);
  }, [members]);


  const renderCategories = (categories) => {
    let myCategories = [];
    for (let category of categories) {
      myCategories.push({
        title: showingTranslateValue(category.name),
        key: category._id,
        children:
          category?.children?.length > 0 && renderCategories(category.children),
      });
    }

    return myCategories;
  };

  const findObject = (obj, target) => {
    return obj._id === target
      ? obj
      : obj?.children?.reduce(
          (acc, obj) => acc ?? findObject(obj, target),
          undefined
        );
  };

  const handleSelect = (key) => {
    setSelectedCategory(key);
  };

  const handleRemove = (v) => {
    setSelectedCategory(v);
  };

  const handleSearch = (v) => {
    setSearchedText(v);
  };

  return (
    <>
      <div className="mb-2">
        <Multiselect
          displayValue="name"
          options={membersData}
          isObject={true}
          hidePlaceholder={true}
          onKeyPressFn={function noRefCheck() {
            console.log("vv");
          }}
          onRemove={(v) => handleRemove(v)}
          onSearch={(v) => handleSearch(v)}
          onSelect={(v) => handleSelect(v)}
          selectedValues={selectedCategory}
          placeholder={placeholder == null ? " Select Category " : placeholder}
        ></Multiselect>
      </div>
    </>
  );
};

export default ParentUser;
