import React, { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { fireStore } from "../config/firebase";
import {
    // getAllUsers,
    // getInboxes
} from "../services/ChatService";
import { useAuth } from "../context/AuthContext";

import {
    collection,
    onSnapshot,
    orderBy,
    query,
    where,
} from "firebase/firestore";

import ChatRoom from "../components/chat/ChatRoom";
import Welcome from "../components/chat/Welcome";
import AllUsers from "../components/chat/AllUsers";
import SearchUsers from "../components/chat/SearchUsers";
import { useTranslation } from "react-i18next";
import { IoBagHandle } from "react-icons/io5";

//internal import
import useAsync from "@/hooks/useAsync";
import OrderServices from "@/services/OrderServices";
import useFilter from "@/hooks/useFilter";
import PageTitle from "@/components/Typography/PageTitle";
import Loading from "@/components/preloader/Loading";

const CustomerOrder = () => {
    const { id } = useParams();
    const { t } = useTranslation();
    const [inboxes, setInboxes] = useState([])


    useEffect(() => {
        getInboxes();
    }, [])

    const getInboxes = () => {
        let path = `chats`;

        const q = query(
            collection(fireStore, path),
        );
        return onSnapshot(q, (querySnapshot) => {
            let inboxes = [];
            // state.loading = true;
            querySnapshot.forEach((doc) => {
                if (doc.data()) {
                    let data = doc.data();
                    if (data.author) {
                        inboxes.push({
                            name: data.author.name,
                            message: data.lastmessage?.text,
                            id: data.author.id,
                            last_seen: data?.last_seen,
                            cId: doc.id
                        })
                    }
                }
            });
            console.log(inboxes);
            setInboxes(inboxes)
        });
    }
    const { data, loading, error } = useAsync(() =>
        OrderServices.getOrderCustomer(id)
    );

    const { handleChangePage, totalResults, resultsPerPage, dataTable } =
        useFilter(data);

    const [users, SetUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [chatRooms, setChatRooms] = useState([]);
    const [filteredRooms, setFilteredRooms] = useState([]);

    const [currentChat, setCurrentChat] = useState();
    const [onlineUsersId, setonlineUsersId] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    const [isContact, setIsContact] = useState(false);

    const socket = useRef();

    // const { currentUser } = useAuth();

    // useEffect(() => {
    //     const getSocket = async () => {
    //         const res = await initiateSocketConnection();
    //         socket.current = res;
    //         socket.current.emit("addUser", currentUser.uid);
    //         socket.current.on("getUsers", (users) => {
    //             const userId = users.map((u) => u[0]);
    //             setonlineUsersId(userId);
    //         });
    //     };

    //     getSocket();
    // }, [currentUser.uid]);

    // useEffect(() => {
    //     const fetchData = async () => {
    //         const res = await getChatRooms();
    //         setChatRooms(res);
    //     };

    //     fetchData();
    // }, []);

    // useEffect(() => {
    //     const fetchData = async () => {
    //         const res = await getAllUsers();
    //         SetUsers(res);
    //     };

    //     fetchData();
    // }, []);

    useEffect(() => {
        setFilteredUsers(users);
        setFilteredRooms(chatRooms);
    }, [users, chatRooms]);

    useEffect(() => {
        if (isContact) {
            setFilteredUsers([]);
        } else {
            setFilteredRooms([]);
        }
    }, [isContact]);

    const handleChatChange = (chat) => {
        setCurrentChat(chat);
    };

    const handleSearch = (newSearchQuery) => {
        setSearchQuery(newSearchQuery);

        const searchedUsers = users.filter((user) => {
            return user.displayName
                .toLowerCase()
                .includes(newSearchQuery.toLowerCase());
        });

        const searchedUsersId = searchedUsers.map((u) => u.uid);

        // If there are initial contacts
        if (chatRooms.length !== 0) {
            chatRooms.forEach((chatRoom) => {
                // Check if searched user is a contact or not.
                const isUserContact = chatRoom.members.some(
                    (e) => e !== currentUser.uid && searchedUsersId.includes(e)
                );
                setIsContact(isUserContact);

                isUserContact
                    ? setFilteredRooms([chatRoom])
                    : setFilteredUsers(searchedUsers);
            });
        } else {
            setFilteredUsers(searchedUsers);
        }
    };

    return (
        <>
            <PageTitle>Support</PageTitle>

            {loading && <Loading loading={loading} />}
            {!error && !loading && dataTable.length === 0 && (
                <div className="w-full bg-white rounded-md dark:bg-gray-800">
                    <div className="p-8 text-center">
                        <span className="flex justify-center my-30 text-red-500 font-semibold text-6xl">
                            <IoBagHandle />
                        </span>
                        <h2 className="font-medium text-base mt-4 text-gray-600">
                            {t("CustomerOrderEmpty")}
                        </h2>
                    </div>
                </div>
            )}
            <div className="container mx-auto">
                <div className="min-w-full bg-white border-x border-b border-gray-200 dark:bg-gray-900 dark:border-gray-700 rounded lg:grid lg:grid-cols-3">
                    <div className="bg-white border-r border-gray-200 dark:bg-gray-900 dark:border-gray-700 lg:col-span-1">
                        <SearchUsers handleSearch={handleSearch} />

                        <AllUsers
                            users={searchQuery !== "" ? filteredUsers : inboxes}
                            chatRooms={searchQuery !== "" ? filteredRooms : chatRooms}
                            setChatRooms={setChatRooms}
                            onlineUsersId={onlineUsersId}
                            changeChat={handleChatChange}
                        />
                    </div>

                    {currentChat ? (
                        <ChatRoom
                            currentChat={currentChat}
                        />
                    ) : (
                        <Welcome />
                    )}
                </div>
            </div>

        </>
    );
};

export default CustomerOrder;
