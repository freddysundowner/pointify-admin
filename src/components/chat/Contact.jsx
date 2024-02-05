import { useState, useEffect } from "react";

import UserLayout from "../layouts/UserLayout";

export default function Contact({ chatRoom, onlineUsersId, contact }) {

  return <UserLayout user={chatRoom} onlineUsersId={onlineUsersId} />;
}
