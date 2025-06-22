// EmailTemplatePage.js
import React, { useState } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import useCommunication from "@/hooks/useCommunication";
import SwitchToggle from "@/components/form/switch/SwitchToggle";

const EmailTemplatePage = () => {
    
  const { register, handleSubmit, onSubmit, errors,
    subject,
      recipients,
    schedule,
    setSchedule,
    body,
    audience,
    setSubject,
    setBody,
    setAudience,
    setRecipients,
    setInterval,
    interval,
    data: templates,
    name,
    setName,
    save,
    setSave,
    defaultTemplate,
    setDefaultTemplate } =
    useCommunication();
  return (
    <div className="p-6 mt-10 mx-4 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-semibold mb-4">Create Email</h1>
          <form onSubmit={onSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Select Template</label>
                <select
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={defaultTemplate}
                    onChange={(e) => setDefaultTemplate(e.target.value)}
                >
                    <option value="">Select Email Template</option>
                  {
                    templates.map((templ) => <option key={templ._id} value={templ._id}>{templ.subject}</option>)
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
                    <option value="custom">Custom Email</option>
                    <option value="subscribers">Subscribers</option>
                    <option value="all">All Users</option>
                    <option value="expired">Expired Production Shops</option>
                    <option value="trial">Active Trials</option>
                    <option value="trial_expired">Expired Trials</option>
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
          
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Schedule?</label>
                <select
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={schedule}
                    onChange={(e) => setSchedule(e.target.value)}
                >
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                </select>
        </div>
        </> : <></>}
            {schedule =='true' ? <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Interval</label>
                <select
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={interval}
                    onChange={(e) => setInterval(e.target.value)}
                >
                    <option value="daily">Send Every Day (default time is midnight)</option>
                    <option value="monthly">Monthly (default time is midnight the last day of the month)</option>
                </select>
              </div> : ""}
              
        {
          audience =='custom' ? <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Recipients (comma separated):</label>
                <input
                    type="text"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={recipients}
                    onChange={(e) => setRecipients(e.target.value)}
                />
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
            <CKEditor
              editor={ClassicEditor}
              data={body}
              onChange={(event, editor) => {
                const data = editor.getData();
                setBody(data);
              }}
            />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Send Email
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmailTemplatePage;
