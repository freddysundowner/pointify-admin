import {  useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { notifyError, notifySuccess } from "@/utils/toast";
import CommunicationService from "@/services/Communication";
import CustomerServices from "@/services/UserServices";

const useSms = (id) => {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [emailType, setEmailType] = useState('single');
  const [members, setMembers] = useState([]);
  const [recipients, setRecipients] = useState('');
  const [schedule, setSchedule] = useState('false');
  const [audience, setAudience] = useState('all');
  const [interval, setInterval] = useState('daily');
  const [templates, setTemplates] = useState([]);
  const [name, setName] = useState('');
  const [save, setSave] = useState(false);
  const [defaultTemplate, setDefaultTemplate] = useState("")
  const [templateId, setTemplateId] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    console.log(defaultTemplate);
    if (defaultTemplate != "") {
      let setTemplate = templates.filter((templ) => templ._id == defaultTemplate)[0]
      if (setTemplate) {
        console.log(setTemplate);
        setSubject(setTemplate.subject)
        setBody(setTemplate.body)
        setInterval(setTemplate.interval)
        setAudience(setTemplate.audience)
        setSchedule(setTemplate.sheduled)
        setRecipients(setTemplate.audienceAddress)
        setTemplateId(setTemplate._id)
      }
    } else {
       setSubject('')
        setBody('')
        setInterval('')
        setAudience('all')
        setSchedule('')
        setRecipients('')
        setTemplateId('')
    }
  },[defaultTemplate])
  
  const setSearchedText = async (v) => {
    let res = await CustomerServices.filterCustomer(v);
    console.log("setSearchedText ", v, res);
    setMembers(res);
  };
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },  
  } = useForm();
  const isValidEmail = (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
  };
  const onSubmit = async (e,data) => {
    e.preventDefault();
    try {
      let payload = { subject, name, body, audience, to: recipients, interval, schedule: schedule == "true" ? true : false,save,templateId, sms:true };
      console.log(payload); 
      if (save) {
        if (name == '') {
           notifyError("template name is required");
          return;
        }
        if (schedule == "true") {
          notifyError("template name is required");
          return;
        }
      }
      if (audience == 'custom') {
        if (recipients == '') {
           notifyError("enter audience phone number");
          return;
        }
        
      }
      if (subject =="" || body =='') {
        notifyError(`sms contentand title must be provided `);
        return;
      }
      setIsSubmitting(true);
      const res = await CommunicationService.sendEmail(payload);
      notifySuccess(res.message);
      setIsSubmitting(false);
    } catch (err) {
      setIsSubmitting(false);
      notifyError(err?.response?.data?.message || err?.message);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await CommunicationService.getEmailTemplates();
        if (res) {
          console.log(res.response)
          setTemplates(res.response);
        }
      } catch (err) {
        notifyError(err?.response?.data?.message || err?.message);
      }
    })();
  }, []);

  return {
    errors,
    register,
    onSubmit,
    handleSubmit,
    subject,
    recipients,
    body,
    emailType,
    setSubject,
    setBody,
    setEmailType,
    setRecipients,
    schedule, setSchedule,
    setSearchedText,
    isSubmitting,
    setAudience,audience,setInterval,interval,templates,name,setName,save,setSave,defaultTemplate, setDefaultTemplate
  };
};

export default useSms;
