/* eslint-disable react-hooks/exhaustive-deps */
import Ajv from "ajv";
import csvToJson from "csvtojson";
import { useContext, useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";

//internal import
import { SidebarContext } from "@/context/SidebarContext";
import ProductServices from "@/services/ProductServices";
import { notifyError, notifySuccess } from "@/utils/toast";

// custom product upload validation schema
const schema = {
  type: "object",
  properties: {
    categories: { type: "array" },
    image: { type: "array" },
    tag: { type: "array" },
    variants: { type: "array" },
    show: { type: "array" },
    status: { type: "string" },
    prices: { type: "object" },
    isCombination: { type: "boolean" },
    title: { type: "object" },
    productId: { type: "string" },
    slug: { type: "string" },
    category: { type: "object" },
    stock: { type: "number" },
    description: { type: "object" },
  },
  required: ["categories", "category", "prices", "title"],
};

const useProductFilter = (data) => {
  const ajv = new Ajv({ allErrors: true });
  const { setLoading, setIsUpdate } = useContext(SidebarContext);

  const [newProducts] = useState([]);
  const [selectedFile, setSelectedFile] = useState([]);
  const [filename, setFileName] = useState("");
  const [isDisabled, setIsDisable] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [dataTable, setDataTable] = useState([]);
  const [time, setTime] = useState("");
  const [filter, setFilter] = useState("");
  const [sortedField, setSortedField] = useState("");
  const [searchText, setSearchText] = useState("");

  //service data filtering
  const serviceData = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - time);
    let services = data?.shops?.map((el) => {
      const newObj = {
        ...el,
      };
      return newObj;
    });
    if (location.pathname === "/dashboard") {
      const orderPending = services?.filter(
        (statusP) => statusP.status === "Pending"
      );
      setPending(orderPending);
      const orderProcessing = services?.filter(
        (statusO) => statusO.status === "Processing"
      );
      setProcessing(orderProcessing);
      const orderDelivered = services?.filter(
        (statusD) => statusD.status === "Delivered"
      );
      setDelivered(orderDelivered);
    }
    //products filtering
    if (filter) {
      services = services.filter((item) => item.parent === filter);
    }
    if (sortedField === "Low") {
      services = services.sort((a, b) => a.price < b.price && -1);
    }
    if (sortedField === "High") {
      services = services.sort((a, b) => a.price > b.price && -1);
    }
    if (searchText) {
      services = services.filter((search) =>
        search?.title?.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    // order filtering
    if (status) {
      services = services.filter((order) => order.status === status);
    }
    if (time) {
      services = services.filter((order) =>
        dayjs(order.createdAt).isBetween(date, new Date())
      );
    }
    return services;
  }, [
    time,
    data,
    location.pathname,
    status,
  ]);

  //pagination functionality start
  console.log(serviceData)
  const resultsPerPage = 20;
  const totalResults = serviceData?.totalShops;
  const handleChangePage = (p) => {
    setCurrentPage(p);
  };
  useEffect(() => {
    setDataTable(
      serviceData?.slice(
        (currentPage - 1) * resultsPerPage,
        currentPage * resultsPerPage
      )
    );
  }, [serviceData, currentPage, resultsPerPage]);
  //  console.log('selectedFile',selectedFile)

  const handleOnDrop = (data) => {
    // console.log('data', data);
    for (let i = 0; i < data.length; i++) {
      newProducts.push(data[i].data);
    }
  };

  const handleUploadProducts = () => {
    // return notifyError("This feature is disabled for demo!");
    if (newProducts.length < 1) {
      notifyError("Please upload/select csv file first!");
    } else {
      // notifySuccess('CRUD operation disable for demo!');
      ProductServices.addAllProducts(newProducts)
        .then((res) => {
          notifySuccess(res.message);
        })
        .catch((err) => notifyError(err.message));
    }
  };

  const handleSelectFile = async (e) => {
    e.preventDefault();

    const fileReader = new FileReader();
    const file = e.target?.files[0];

    if (file && file.type === "application/json") {
      setFileName(file?.name);
      setIsDisable(true);

      fileReader.readAsText(file, "UTF-8");
      fileReader.onload = (e) => {
        const text = JSON.parse(e.target.result);

        const productData = text.map((value) => {
          return {
            categories: value.categories,
            image: value.image,
            barcode: value.barcode,
            tag: value.tag,
            variants: value.variants,
            status: value.status,
            prices: value.prices,
            isCombination: value.isCombination,
            title: value.title,
            productId: value.productId,
            slug: value.slug,
            sku: value.sku,
            category: value.category,
            stock: value.stock,
            description: value.description,
          };
        });

        setSelectedFile(productData);
      };
    } else if (file && file.type === "text/csv") {
      setFileName(file?.name);
      setIsDisable(true);

      fileReader.onload = async (event) => {
        const text = event.target.result;
        const json = await csvToJson().fromString(text);
        // console.log('json',json)
        const productData = json.map((value) => {
          return {
            categories: JSON.parse(value.categories),
            image: JSON.parse(value.image),
            barcode: value.barcode,
            tag: JSON.parse(value.tag),
            variants: JSON.parse(value.variants),
            status: value.status,
            prices: JSON.parse(value.prices),
            isCombination: JSON.parse(value.isCombination),
            title: JSON.parse(value.title),
            productId: value.productId,
            slug: value.slug,
            sku: value.sku,
            category: JSON.parse(value.category),
            stock: JSON.parse(value.stock),
            description: JSON.parse(value.description),
          };
        });

        setSelectedFile(productData);
      };

      fileReader.readAsText(file);
    } else {
      setFileName(file?.name);
      setIsDisable(true);

      const rABS = !!fileReader.readAsBinaryString;

      fileReader.onload = function (event) {
        /* Parse data */
        const bstr = event.target.result;
        const wb = XLSX.read(bstr, {
          type: rABS ? "binary" : "array",
          bookVBA: true,
        });
        /* Get first worksheet */
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        /* Convert array of arrays */
        const json = XLSX.utils.sheet_to_json(ws);

        const productData = json.map((value) => {
          return {
            categories: JSON.parse(value.categories),
            image: JSON.parse(value.image),
            barcode: value.barcode,
            tag: JSON.parse(value.tag),
            variants: JSON.parse(value.variants),
            status: value.status,
            prices: JSON.parse(value.prices),
            isCombination: JSON.parse(value.isCombination),
            title: JSON.parse(value.title),
            productId: value.productId,
            slug: value.slug,
            sku: value.sku,
            category: JSON.parse(value.category),
            stock: JSON.parse(value.stock),
            description: JSON.parse(value.description),
          };
        });
        setSelectedFile(productData);
      };

      if (rABS) {
        fileReader.readAsBinaryString(file);
      } else {
        fileReader.readAsArrayBuffer(file);
      }
    }
  };

  const handleUploadMultiple = (e) => {
    // return notifyError("This feature is disabled for demo!");
    if (selectedFile.length > 1) {
      setLoading(true);
      let productDataValidation = selectedFile.map((value) =>
        ajv.validate(schema, value)
      );

      const isBelowThreshold = (currentValue) => currentValue === true;
      const validationData = productDataValidation.every(isBelowThreshold);
      // console.log('validationdata',validationData)

      if (validationData) {
        ProductServices.addAllProducts(selectedFile)
          .then((res) => {
            setIsUpdate(true);
            setLoading(false);
            notifySuccess(res.message);
          })
          .catch((err) => {
            setLoading(false);
            notifyError(err.message);
          });
      } else {
        setLoading(false);
        notifyError("Please enter valid data!");
      }
    } else {
      setLoading(false);
      notifyError("Please select a valid json, csv & xls file first!");
    }
  };

  const handleRemoveSelectFile = (e) => {
    // console.log('remove');
    setFileName("");
    setSelectedFile([]);
    setTimeout(() => setIsDisable(false), 1000);
  };

  return {
    data,
    filename,
    isDisabled,
    handleSelectFile,
    serviceData,
    handleOnDrop,
    handleUploadProducts,
    handleRemoveSelectFile,
    handleUploadMultiple, handleChangePage, resultsPerPage, totalResults,

    dataTable,
    setDataTable,
  };
};

export default useProductFilter;
