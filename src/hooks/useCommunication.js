import { useContext,  useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { SidebarContext } from "@/context/SidebarContext";
import { notifyError, notifySuccess } from "@/utils/toast";
import { useDispatch } from "react-redux";
import CommunicationService from "@/services/Communication";

const useCommunication = (id) => {
  const dispatch = useDispatch();
  const { setIsUpdate } = useContext(SidebarContext);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [emailType, setEmailType] = useState('single');
  const [recipients, setRecipients] = useState('');
  const [schedule, setSchedule] = useState('false');
  const [audience, setAudience] = useState('custom');
  const [interval, setInterval] = useState('daily');
  const [data, setTemplates] = useState([]);
  const [name, setName] = useState('');
  const [save, setSave] = useState(false);
  const [defaultTemplate, setDefaultTemplate] = useState("")
  const [templateId, setTemplateId] = useState("")

  useEffect(() => {
    console.log(defaultTemplate);
    if (defaultTemplate != "") {
      let setTemplate = data.filter((templ) => templ._id == defaultTemplate)[0]
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
        setAudience('custom')
        setSchedule('')
        setRecipients('')
        setTemplateId('')
    }
  },[defaultTemplate])
  

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
      let payload = { subject, name, body, audience, to: recipients, interval, schedule: schedule == "true" ? true : false,save,templateId };
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
           notifyError("enter audience email address");
          return;
        }
        let emails = recipients.split(",")
        emails.forEach((email) => {
          if (!isValidEmail(email)) {
             notifyError(`${email} email not valid `);
            return;
          }
        });
        
      }
      if (subject =="" || body =='') {
        notifyError(`email subject and email content must be provided `);
        return;
      }
      const res = await CommunicationService.sendEmail(payload);
      notifySuccess(res.message);
    } catch (err) {
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
    setAudience,audience,setInterval,interval,data,name,setName,save,setSave,defaultTemplate, setDefaultTemplate
  };
};

export default useCommunication;
