// SMSTemplatePage.js
import React,{useEffect, useState} from 'react';
import { Button } from "@windmill/react-ui";
import useSms from "@/hooks/useSms";
import SwitchToggle from "@/components/form/switch/SwitchToggle";
import LabelArea from "@/components/form/selectOption/LabelArea";
import ParentUser from "@/components/category/ParentUser";
import useCustomerSubmit from "@/hooks/useCustomerSubmit";
import spinnerLoadingImage from "@/assets/img/spinner.gif";


const SMSTemplatePage = () => {
    
  const { onSubmit,
    subject,
    body,
    audience,
    setSubject,
    setBody,
    setAudience,
    setRecipients,
    templates,
    name,
    setName,
    save,
    setSave,
    defaultTemplate,isSubmitting,
    setDefaultTemplate } =
    useSms();  
  const {
    selectedCategory,
    setSelectedCategory,
    setDefaultCategory,
    setSearchedText,
    members,
  } = useCustomerSubmit();

  useEffect(() => {
    setRecipients(selectedCategory.map((member) => member?.mpesaNumber))
  },[selectedCategory])

    
  return (
    <div className="p-6 mt-10 mx-4 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-semibold mb-4">Create SMS</h1>
          <form onSubmit={onSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Select Template</label>
                <select
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={defaultTemplate}
                    onChange={(e) => setDefaultTemplate(e.target.value)}
                >
                    <option value="">Select Sms Template</option>
                  {
                    templates.map((templ) => <option key={templ._id} value={templ._id}>{templ.name}</option>)
                  }
                      </select>
              </div>

              
        
        
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Audience:</label>
                <select
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                >
                    <option value="custom">Custom Sms</option>
                    <option value="all">All Users</option>
                    <option value="subscribers">Subscribers</option>
                    <option value="expired">Expired Shops</option>
                    <option value="dormant">Dormant Shop Owners</option>
                </select>
        </div>
          <div className="grid md:grid-cols-5 items-center sm:grid-cols-12 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
                    <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1 sm:col-span-2">
                      Save Template
                    </label>
                    <div className="sm:col-span-3">
                      <SwitchToggle
                        handleProcess={setSave}
                        processOption={save}
                      />
                    </div>
                  </div>
        {save == true ? <>
        <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Template Name</label>
                <input
                  type="text"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
          </div>
        </> : <></>}
              
        {
          audience =='custom' ? <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
                <LabelArea label="Members to receive sms" className="block text-gray-700 text-sm font-bold mb-2"/>
                <div className="col-span-12 sm:col-span-12">
                  <ParentUser
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    setDefaultCategory={setDefaultCategory}
                    setSearchedText={setSearchedText}
                    members={members}
                    placeholder="Search member"
                  />
                </div>
              </div> : <></>
              }
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Subject:</label>
          <input
            type="text"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Body:</label>
          <div className="border rounded-lg shadow-sm">
            <textarea
              type="text"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex-grow-0 md:flex-grow lg:flex-grow xl:flex-grow">
          {isSubmitting ==true ? (
            <Button disabled={true} type="button" className="w-full h-12">
              <img
                src={spinnerLoadingImage}
                alt="Loading"
                width={20}
                height={10}
              />{" "}
              <span className="font-serif ml-2 font-light">Processing</span>
            </Button>
          ) : (
            <Button type="submit" className="w-full h-12">
              <span>Send Sms</span>
            </Button>
          )}
        </div>
        </div>
      </form>
    </div>
  );
};

export default SMSTemplatePage;
