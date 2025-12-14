import React, { FormEvent, useEffect, useRef, useState, } from "react";
import { useNavigate } from 'react-router-dom';
import { saveAs } from 'file-saver';

import * as Icons from '../Icons';
import * as Images from '../Images';
import axiosInstance from "../../Api/Axios";

import { useDispatch } from 'react-redux';
import { RootState } from "../../store";
import { useSelector } from "react-redux";

import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { io, Socket } from "socket.io-client";

import EditorLayout from "./Editor/EditorLayout";
import { setBreadCrumb, setTitle, setDisableBtnWhileScreaming, clearDisableBtnWhileScreaming } from "../Navbar/NavbarSlice";

import { addStreamingTopic, getStreamingTopic, updateStreamingTopic } from './Editor/StreamingDB';

import Toolbars from "./EditorComponents/Toolbar";
import { marked } from "marked";
import ReviewModal from "./Assembly/Modal/ReviewModal";

//const socket = io("http://44.225.186.7:3001/");
//const socket = io("https://dev-apicoursebuilder.dictera.com");
const socket = io("https://dev-apicoursebuilder.dictera.com/", { path: "/regenerate/socket-io", });

let _activeTopic = "";

export interface EditorLayoutHandle {
    getData: () => string;
    addComment: (user: string) => string;
    updateCommentsJsonData: (commentId: string, jsonValue: string) => void;
    getAllComments: () => void;
    removeComment: (id: string) => void;
    addBugs: (user: string) => string;
    updateBugsJsonData: (bugId: string, jsonValue: string) => void;
    getAllBugs: () => void;
    removeBugs: (id: string) => void;
    scrollTo: (id: string) => void;
    scrollToTrack: (timestamp: string) => void;
    scrollToBottom: () => void;
    scrollToTop: () => void;
    acceptChange: (timestamp: string) => void;
    rejectChange: (timestamp: string) => void;
    getAllChanges: () => void;
    updateTrackJson: (timestamp: string, jsonValue: string) => void;
    toggleTrackChange: () => void;
    insertTemplate: (templateHTML: string) => void;
    InsertRegenContentFromAI: (htmlContent: string) => void;
    toggleReadOnly: (toggle: boolean) => void;
    alwaysEnbaleTrack: () => void;
}

const Editor: React.FC = () => {

    const socket1Ref = useRef<Socket | null>(null);
    const socket2Ref = useRef<Socket | null>(null);
    const navigate = useNavigate();

    const dispatch = useDispatch();

    const username = useSelector((state: RootState) => state.login.username);
    const project: any = useSelector((state: RootState) => state.projectCreation.project);
    const courseName = useSelector((state: RootState) => state.courseCreation.courseName);
    const disableBtnWhileScreaming = useSelector((state: RootState) => state.navbar.disableBtnWhileScreaming);
    const [disableMarkAsDone, setDisableMarkAsDone] = useState<boolean>(false);


    const permissions: any = useSelector((state: RootState) => state.login.hasPermissions);
    const currentPermissions = useSelector((state: RootState) => state.login.permissions);

    const [isSaved, setSaved] = useState<boolean>(false);
    const [showToast, setShowToast] = useState<boolean>(false);

    const [isToggleChecked, setToggleChecked] = useState<boolean>(false);
    const [tocData, setTocData] = useState<any[]>([]);

    const editorRef = useRef<EditorLayoutHandle>(null);

    const [isShowPreview, setShowPreview] = useState<boolean>(false);
    const [showLeftArrow, setShowLeftArrow] = useState<boolean>(false);
    const [showRightArrow, setShowRightArrow] = useState<boolean>(true);
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);
    const [activeSideTab, setActiveSideTab] = useState<string | undefined>('tab-1');
    const [bugsList, setBugsList] = useState<any[]>([]);
    const [isBugOptionShow, setBugOptionShow] = useState<boolean>(false);
    const [isBugDetailShow, setBugDetailShow] = useState<boolean>(false);

    const [showSendNextBtn, setSendNextBtn] = useState<any>({
        btnVisible: false,
        workflowName: ""
    });

    const [showSendBackBtn, setSendBackBtn] = useState<any>({
        btnVisible: false,
        workflowName: ""
    });


    const [showPlublish, setShowPublish] = useState<boolean>(false);

    const [isOpenBugsModal, setOpenBugsModal] = useState<boolean>(false);

    const [isLOModalOpen, setLOIsModalOpen] = useState(false);
    const [isOpenRegenContentAI, setOpenRegenContentAI] = useState<boolean>(false);

    const [isOpenCommentModal, setOpenCommentModal] = useState<boolean>(false);
    const [commentList, setCommentList] = useState<any[]>([]);
    const [isCommentReplyShow, setCommentReplyShow] = useState<boolean>(false);
    const [repliesList, setRepliesList] = useState<any>({});
    const [message, setMessage] = useState('');
    const [htmlContent, setHtmlContent] = useState<string>('');
    const [inputHtmlContent, setInputHtmlContent] = useState<string>('');

    const [trackChangeList, setTrackChangesList] = useState<any[]>([]);

    const [showSendModal, setShowSendModal] = useState<boolean>(false);

    const bugsTypes = [
        'Punctuations errors',
        'Capitalization errors',
        'Contraction used',
        'Unclear or misplaced modifier',
        'Punctuations errors'
    ];
    const [currentBugType, setCurrentBugType] = useState<string | null>(null);
    const [isReadyEditor, setReadyEditor] = useState<boolean>(false);

    const courseId = useSelector((state: RootState) => state.courseCreation.courseId);

    const [collapseToc, setCollapseToc] = useState<boolean>(false);

    const [isRegeneratewithAIModal, setRegeneratewithAIModal] = useState<boolean>(false);
    const [isLoading, setIsloading] = useState<boolean>(false);

    const [moduleId, setModuleId] = useState<any[]>([]);

    const [isReadyOnly, setReadyOnly] = useState<boolean>(false);

    const handleRegeneratewithAI = (prompt: string) => {
        setIsloading(true);

        const activeTopic = steamingContent[_activeTopic];

        socket.emit('regenerate-node',
            {
                courseId: courseId,
                moduleId: activeTopic.moduleId,
                parentId: activeTopic.parentId,
                node_id: activeTopic.nodeType === "topic" ? activeTopic.node_id : _activeTopic,
                userId: activeTopic.userId,
                prompt: prompt
            }
        );
        //setRegeneratewithAIModal(!isRegeneratewithAIModal);

    }

    const handleSpecificRegeneratewithAI = async (prompt: string) => {
        const activeTopic = steamingContent[_activeTopic];

        setIsloading(true);
        try {
            const response = await axiosInstance.post('/page/contentRegenerate', {
                "courseId": courseId,
                "moduleId": activeTopic.moduleId,
                "parentId": activeTopic.parentId,
                "node_id": activeTopic.nodeType === "topic" ? activeTopic.node_id : _activeTopic,
                "existing_content": inputHtmlContent,
                "user_prompt": prompt
            }, {
                headers: { 'userId': '88796200-3f4c-4616-b0fc-34cb62222123456' }
            });

            if (response.status === 200) {
                if (editorRef.current) {
                    editorRef.current.InsertRegenContentFromAI(response.data.data.response);
                }
                setIsloading(false);
            }
        } catch (error) {
            console.log(error);
            setIsloading(false);
            //setOpenRegenContentAI(!isOpenRegenContentAI);
        }
    }

    const handleToggleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        setToggleChecked(event.target.checked);

        try {
            const payload = {
                "projectId": project.projectId,
                "title": courseName,
                "markasdone": event.target.checked.toString(),
            };
            const response = await axiosInstance.put(`/course/update/${courseId}`, payload, {
                headers: {
                    'userId': '88796200-3f4c-4616-b0fc-34cb62222123456',
                    'Content-Type': 'application/json'
                },
            });

            if (response.status === 200) {
                console.log(response.data.data);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const unitModules = useSelector((state: RootState) => state.courseCreation.unitModules);

    const [steamingContent, setSteamingContent] = useState<Record<string, any>>({});

    const capitalizeFirstLetter = (str: string): string => {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    const fetchModuleDetailsById = async (moduleId: string) => {
        try {
            const response: any = await axiosInstance.get(`/module/${moduleId}`);

            if (response.status === 200 && response.data.message === "Success") {
                setModuleId(response.data.data.moduleId);
                setTocData(prevData => [...prevData, {
                    module_name: response.data.data.name,
                    topic_names: response.data.data.children.filter(Boolean).map((topic: any) => ({
                        name: topic.nodeType === "topic" ? topic.name : topic.nodeType === "assessment" ? capitalizeFirstLetter(topic.name) : topic.pageTitle,
                        topicId: topic.nodeType === "topic" ? topic.topicId : topic.nodeType === "assessment" ? topic.assessmentId : topic.pageId,
                        nodeType: topic.nodeType
                    })),
                    moduleId: response.data.data.moduleId,
                    id: response.data.data.userId
                }]);

                response.data.data.children
                    .filter(Boolean)
                    .forEach((topic: any) => {
                        setSteamingContent(prevState => ({
                            ...prevState,
                            [topic.nodeType === "topic" ? topic.topicId : topic.nodeType === "assessment" ? topic.assessmentId : topic.pageId]: {
                                is_complete: false,
                                broadcast: topic.broadcast,
                                content: "",
                                nodeType: topic.nodeType,
                                pageId: topic.nodeType === "assessment" ? topic.assessmentId : topic.pageId,
                                userId: topic.userId,
                                parentId: topic.parentId,
                                moduleId: response.data.data.moduleId
                            }
                        }));
                    });

            }
        } catch (error) {
            console.log(error);
        }
    }

    const fetchCourseDetails = async (courseId: string | undefined) => {
        try {
            const response: any = await axiosInstance.get(`/course/${courseId}`);

            if (response.status === 200 && response.data.message === "Success") {
                //console.log(response.data.data);
                for await (const [index, module] of response.data.data.modules.entries()) {
                    await fetchModuleDetailsById(module.moduleDetails.moduleId);
                }
            }
        } catch (error) {
            console.log(error);
        }
    }

    const scroll = (direction: 'left' | 'right'): void => {
        const container = scrollContainerRef.current;
        const scrollAmount = 200;

        if (container) {
            const newScrollLeft = direction === 'left'
                ? container.scrollLeft - scrollAmount
                : container.scrollLeft + scrollAmount;

            container.scrollTo({
                left: newScrollLeft,
                behavior: 'smooth'
            });
        }
    };

    const handleScroll = (): void => {
        const container = scrollContainerRef.current;
        if (container) {
            setShowLeftArrow(container.scrollLeft > 0);
            setShowRightArrow(
                container.scrollLeft < (container.scrollWidth - container.clientWidth)
            );
        }
    };

    const handleOpenBugModal = (bugTyle: string) => {
        setOpenBugsModal(true);
        setCurrentBugType(bugTyle);
    }

    const handleBugDetail = (bug: any) => {
        editorRef.current?.scrollTo(bug.id);
        setBugDetailShow(true);
        setRepliesList(bug);
        setToggleBugChecked(bug.resolved !== 'open' ? true : false);
    }

    const handleBackList = () => {
        setBugDetailShow(false);
    }

    const handleAcceptChange = (timestamp: string) => {
        editorRef.current?.acceptChange(timestamp);
        retriveAllTrackList();
    }

    const handleRejectChange = (timestamp: string) => {
        editorRef.current?.rejectChange(timestamp);
        retriveAllTrackList();
    }

    const handleShowRepiles = (comment: any) => {
        editorRef.current?.scrollTo(comment.id);
        setCommentReplyShow(true);
        setRepliesList(comment);
    };

    const handleDeleteComment = (id: string) => {
        //console.log(id);
        editorRef.current?.removeComment(id);
        const updated = [...commentList];


        const filteredData = updated.filter(item => item.id !== id);


        setCommentList(filteredData);
    }

    const handleDeleteBug = (id: string) => {
        editorRef.current?.removeBugs(id);
        const updated = [...bugsList];


        const filteredData = updated.filter(item => item.id !== id);


        setBugsList(filteredData);

    }

    const formatTimestamp = (timestamp: string): string => {
        const date = new Date(timestamp);

        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        };

        return date.toLocaleString('en-US', options);
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (message.trim()) {
            //console.log('Message sent:', message);
            const date = new Date();

            const options: Intl.DateTimeFormatOptions = {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            };

            const formattedDate = new Intl.DateTimeFormat('en-US', options).format(date);

            setRepliesList((prevState: any) => ({
                ...prevState,
                replies: [...prevState.replies, { addedDateTime: formattedDate, text: message }]
            }))

            setCommentList((prevComment: any) =>
                prevComment.map((comment: any) => {
                    const json = comment.id === repliesList.id ?
                        { ...comment, replies: [...comment.replies, { addedDateTime: formattedDate, text: message }] }
                        : comment;

                    if (editorRef.current) {
                        editorRef.current.updateCommentsJsonData(json.id, btoa(JSON.stringify(json)));
                    }
                    return json;
                })
            );




            setTimeout(() => {
                const scrollDiv = document.querySelector('#commendReplies');

                if (scrollDiv) {
                    scrollDiv.scrollTo({ top: scrollDiv.scrollHeight, behavior: "smooth" });
                }
            }, 100);
            setMessage('');
        }
    };

    const handleAddComment = (comment: string) => {
        if (comment === '') return;

        if (editorRef.current) {

            const date = new Date();

            const options: Intl.DateTimeFormatOptions = {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            };

            const formattedDate = new Intl.DateTimeFormat('en-US', options).format(date);
            const currentUser = username;

            const id = editorRef.current.addComment(currentUser);

            if (id !== '') {
                const json = {
                    id: id,
                    user: currentUser,
                    text: comment,
                    addedDateTime: formattedDate,
                    replies: []
                };

                setCommentList(prev => [...prev, {
                    id: id,
                    user: currentUser,
                    text: comment,
                    addedDateTime: formattedDate,
                    replies: []
                }]);

                editorRef.current.updateCommentsJsonData(id, btoa(JSON.stringify(json)));
            }
        }
    }

    const handleAddBug = (bugText: string, bugType: string) => {
        if (bugText === '') return;

        if (editorRef.current) {

            const date = new Date();

            const options: Intl.DateTimeFormatOptions = {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            };

            const formattedDate = new Intl.DateTimeFormat('en-US', options).format(date);
            const currentUser = username;

            const id = editorRef.current.addBugs(currentUser);

            if (id !== '') {
                const json = {
                    id: id,
                    user: currentUser,
                    text: bugText,
                    bugType: bugType,
                    addedDateTime: formattedDate,
                    replies: [],
                    resolved: 'open'
                };

                setBugsList(prev => [...prev, json]);
                setBugOptionShow(false);

                editorRef.current.updateBugsJsonData(id, btoa(JSON.stringify(json)));
            }
        }
    }

    const [inputBugText, setInputBugText] = useState<string>("");
    const [activeBugState, setActiveBugState] = useState('open');

    const handleBugStateChange = (state: string) => {
        setActiveBugState(state);
        handleBackList();
    };

    const [isToggleBugChecked, setToggleBugChecked] = useState(false);
    const handleBugToggleChange = (event: React.ChangeEvent<HTMLInputElement>, id: string) => {
        setToggleBugChecked(event.target.checked);
        setBugsList(prevBugsList =>
            prevBugsList.map(bug =>
                bug.id === id ? { ...bug, resolved: bug.resolved === 'open' ? 'resolved' : 'open' } : bug
            )
        );
        setBugDetailShow(false);
    };


    const [isToggleSuggestionChecked, setToggleSuggestionChecked] = useState<boolean>(false);

    //const handleSuggestionToggleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const handleSuggestionToggleChange = (checked: boolean) => {
        setToggleSuggestionChecked(checked);
        if (editorRef.current) {
            editorRef.current.toggleTrackChange();
        }
    };


    const handleBugAddReply = (r: any) => {
        if (inputBugText.trim()) {
            const date = new Date();

            const options: Intl.DateTimeFormatOptions = {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            };

            const formattedDate = new Intl.DateTimeFormat('en-US', options).format(date);

            r.replies.push({
                text: inputBugText,
                addedDateTime: formattedDate
            });
            setInputBugText("");

            if (editorRef.current) {
                editorRef.current.updateBugsJsonData(r.id, btoa(JSON.stringify(r)));
            }

            setTimeout(() => {
                const scrollDiv = document.querySelector('#bugReplies');

                if (scrollDiv) {
                    scrollDiv.scrollTo({ top: scrollDiv.scrollHeight, behavior: "smooth" });
                }
            }, 100);
        }
    };

    const retriveAllbugsList = () => {
        if (editorRef.current) {
            const bugsList: any = editorRef.current.getAllBugs();

            if (bugsList && bugsList.length > 0) {
                setBugsList(bugsList);
            }

        }
    }

    const retriveAllcommentsList = () => {
        if (editorRef.current) {
            const commentsList: any = editorRef.current.getAllComments();

            if (commentsList && commentsList.length > 0) {
                setCommentList(commentsList);
            }

        }
    }

    const retriveAllTrackList = () => {
        if (editorRef.current) {
            const trackList: any = editorRef.current.getAllChanges();

            if (trackList.length > 0) {
                const decodeJsons = trackList.map((entry: any) => {
                    if (entry.json) {
                        try {
                            const decoded = atob(entry.json);
                            const parsed = JSON.parse(decoded);

                            // Add 'replies' as empty array if not present
                            return parsed;
                        } catch (err) {
                            console.error("Failed to parse JSON:", err);
                            return entry;
                        }
                    }

                    if (!entry.hasOwnProperty('replies')) {
                        entry.replies = [];
                    }

                    return entry;
                });


                if (decodeJsons && decodeJsons.length > 0) {
                    setTrackChangesList(decodeJsons);
                }
            } else {
                setTrackChangesList([]);
            }

        }
    }

    const handleOpenTab = (tab: string) => {
        //if (currentStep === 'step_5' || currentStep === 'step_6') return;
        //if (disableMarkAsDone) return;
        switch (tab) {
            case 'Bug':
                setCollapseToc(true);
                setActiveSideTab('tab-1');
                retriveAllbugsList();
                break;
            case 'Quality Checks':
                setCollapseToc(true);
                setActiveSideTab('tab-2');
                break;
            case 'Comments':
                setCollapseToc(true);
                setActiveSideTab('tab-3');
                retriveAllcommentsList();
                break;
            case 'Meta Tags':
                setCollapseToc(true);
                setActiveSideTab('tab-4');
                break;
            case 'Track Changes':
                setCollapseToc(true);
                setActiveSideTab('tab-5');
                retriveAllTrackList();
                break;
            case 'Style Checks':
                setCollapseToc(true);
                setActiveSideTab('tab-6');
                break;
        }
    }


    const [trackInputs, setTrackInputs] = useState<{ [key: string]: string }>({});

    const handleTrackInputChange = (timestamp: string, value: string) => {
        setTrackInputs({
            ...trackInputs,
            [timestamp]: value
        });
    };


    const handleTrackAdd = (track: any, scrollId: string) => {
        const inputText = trackInputs[track.timestamp] || "";

        if (inputText.trim() === "") return;

        const updatedTrackData = trackChangeList.map((item) => {
            if (item.timestamp === track.timestamp) {

                const date = new Date();

                const options: Intl.DateTimeFormatOptions = {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                };

                const formattedDate = new Intl.DateTimeFormat('en-US', options).format(date);


                const newReply = {
                    text: inputText,
                    addedDateTime: formattedDate
                };

                return {
                    ...item,
                    replies: [...item.replies, newReply]
                };
            }
            return item;
        });

        setTrackChangesList(updatedTrackData);

        setTrackInputs({
            ...trackInputs,
            [track.timestamp]: ""
        });

        if (editorRef.current) {
            editorRef.current.updateTrackJson(track.timestamp, btoa(JSON.stringify(updatedTrackData.find(o => o.timestamp === track.timestamp))));
        }

        setTimeout(() => {
            const scrollDiv = document.querySelector(`#${scrollId}`);

            if (scrollDiv) {
                scrollDiv.scrollTo({ top: scrollDiv.scrollHeight, behavior: "smooth" });
            }
        }, 100);

    };

    const handleInsertTemplate = (templateHTML: string) => {
        if (editorRef.current) {
            editorRef.current.insertTemplate(templateHTML);
        }
    }


    const [metaTags, setMetaTags] = useState([
        "Cloud Infrastructure Solutions",
        "Cloud Architecture Understanding",
        "Security Controls Implementation",
        "Resource Management",
    ]);

    const [customMetaTag, setCustomMetaTag] = useState("");
    const [showCustomContent, setShowCustomContent] = useState(false);

    const removeTag = (tagToRemove: string) => {
        setMetaTags(metaTags.filter((tag) => tag !== tagToRemove));
    };

    /* const addTag = () => {
        if (customMetaTag.trim() && !metaTags.includes(customMetaTag)) {
            setMetaTags([...metaTags, customMetaTag]);
            setCustomMetaTag("");
        }
    }; */



    //const [currentSteamingId, setCurrentSteamingId] = useState<string>('');

    const [currentStep, stepCurrentStep] = useState<string>('');
    const [activeTopic, setActiveTopic] = useState<string>('');
    //const [currentStreamingContent, setCurrentStreamingCoutent] = useState<any>({});


    const getTopicDetailsbyId = async (topicId: string) => {
        setActiveTopic(topicId);
        _activeTopic = topicId;

        setBugsList([]);
        setCommentList([]);
        setTrackChangesList([]);

        if (currentPermissions.type === 'reviewer') {
            // if (!isToggleSuggestionChecked) {
            //     setToggleSuggestionChecked(true);
            setTimeout(async () => {
                if (editorRef.current) {
                    editorRef.current.alwaysEnbaleTrack();
                }
            }, 1000);
            //}
        }

        if (currentStep === 'step_3') {
            setTimeout(async () => {
                if (editorRef.current?.getData() === '<html><head></head><body><p> </p></body></html>') {
                    try {
                        const obj = steamingContent[topicId].nodeType === 'page' ? await _getPageDetailsbyId(topicId) : steamingContent[topicId].nodeType === "assessment" ? await _getAssessmentDetailsbyId(topicId) : await _getTopicDetailsbyId(topicId);
                        if (obj) {
                            const data = {
                                "node_id": topicId,
                                "course_content": obj.htmlContent,
                                pageId: obj.pageId,
                                is_complete: true
                            };
                            contentRef.current = {
                                ...contentRef.current,
                                ...data,
                                ...{ isSteaming: false }
                            }

                            forceUpdate(n => n + 1);
                        }
                    } catch (error) {
                        console.log(error);
                    }
                }
            }, 1000);
        }

    }

    const getCourseDetailsbyId = async (courseId: any): Promise<any | undefined> => {
        try {
            const response = await axiosInstance.get(`/course/${courseId}`);

            if (response.status === 200) {
                return response.data.data;
            }
        } catch (error) {
            console.log(error);
        }
    }

    const [sendBtnState, setSendBtnState] = useState<string>('');

    const handleSelectedMenu = (menu: string) => {
        if (menu === 'preview') {
            setShowPreview(true);
        } else if (menu === 'publish') {
            setShowPublish(true);
        } else if (menu === 'send') {
            setSendBtnState('next');
            setShowSendModal(!showSendModal);
        } else if (menu === 'send_back') {
            setSendBtnState('back');
            setShowSendModal(!showSendModal);
        }

        console.log(menu);
    }

    const handleSave = async (autoSave: boolean = false) => {
        if (editorRef.current) {
            const htmlContent = editorRef.current.getData();
            //console.log(steamingContent[_activeTopic].nodeType);

            if (steamingContent[_activeTopic].nodeType === 'topic') {
                try {
                    const response = await axiosInstance.get(`/topic/${activeTopic !== '' ? activeTopic : _activeTopic}`);

                    if (response.status === 200) {
                        if (response.data.data.pages.length > 0) {
                            const pageId = response.data.data.pages[0].pageId;

                            try {
                                const response = await axiosInstance.put(`/page/update/${pageId}`,
                                    {
                                        "courseId": courseId,
                                        "htmlContent": htmlContent,
                                    },
                                    {
                                        headers: {
                                            'userId': '88796200-3f4c-4616-b0fc-34cb62222123456',
                                            'Content-Type': 'application/json'
                                        },
                                    }
                                );

                                if (response.status === 200) {
                                    //console.log(response.data.data);
                                    //console.log('html saved');
                                    setSaved(autoSave);
                                    if (!autoSave) {
                                        setShowToast(!autoSave);
                                    }
                                }
                            } catch (error) {
                                console.log(error);
                            }

                        }
                    }
                } catch (error) {
                    console.log(error);
                }
            } else if (steamingContent[_activeTopic].nodeType === 'page') {
                try {
                    const response = await axiosInstance.put(`/page/update/${steamingContent[_activeTopic].pageId}`,
                        {
                            "courseId": courseId,
                            "htmlContent": htmlContent,
                        },
                        {
                            headers: {
                                'userId': '88796200-3f4c-4616-b0fc-34cb62222123456',
                                'Content-Type': 'application/json'
                            },
                        }
                    );

                    if (response.status === 200) {
                        //console.log(response.data.data);
                        //console.log('html saved');
                        setSaved(autoSave);
                        if (!autoSave) {
                            setShowToast(!autoSave);
                        }
                    }
                } catch (error) {
                    console.log(error);
                }
            } else if (steamingContent[_activeTopic].nodeType === 'assessment') {
                try {
                    const response = await axiosInstance.put(`/assessment/update/${steamingContent[_activeTopic].pageId}`,
                        {
                            "courseId": courseId,
                            "htmlContent": htmlContent,
                        },
                        {
                            headers: {
                                'userId': '88796200-3f4c-4616-b0fc-34cb62222123456',
                                'Content-Type': 'application/json'
                            },
                        }
                    );

                    if (response.status === 200) {
                        //console.log(response.data.data);
                        //console.log('html saved');
                        setSaved(autoSave);
                        if (!autoSave) {
                            setShowToast(!autoSave);
                        }
                    }
                } catch (error) {
                    console.log(error);
                }
            }

        }
    }

    const _fetchModuleDetailsById = async (moduleId: string): Promise<any | undefined> => {
        try {
            const response: any = await axiosInstance.get(`/module/${moduleId}`, {
                headers: {
                    userId: '88796200-3f4c-4616-b0fc-34cb62222123456'
                }
            });

            if (response.status === 200 && response.data.message === "Success") {
                return (response.data.data);
            }
        } catch (error) {
            console.log(error);
        }
    }

    const courseWorkflowStatusUpdate = async (status: string) => {
        //navigate('/course-creation/CourseContentProgress')
        try {
            const response = await axiosInstance.patch(`/course/workflowStatusUpdate/${courseId}`, {
                "projectId": project.projectId,
                "status": status//"next"
            });

            if (response.status === 200) {
                console.log(response.data.data);
                //navigator()
                setShowSendModal(!showSendModal);
                navigate('/course-creation/CourseContentProgress')
            }
        } catch (error) {
            console.log(error);
            setShowSendModal(!showSendModal);
        }
    }

    const [sendBtnUsername, setSendBtnUsername] = useState<string>('');
    const [sendPrevBtnUsername, setSendPrevBtnUsername] = useState<string>('');

    const getWorkflowStatesList = async (workflowStateId: number, workflows: any[]) => {
        try {
            const response = await axiosInstance.get(`/workflow/${project.workflowId}`);
            if (response.status === 200) {
                //console.log(workflowStateId);
                //console.log(response.data.data);

                if (workflowStateId) {
                    const currentWorkflow = response.data.data.workflowStates.find((o: any) => o.id === workflowStateId);

                    if (currentWorkflow) {
                        if (currentPermissions.type === currentWorkflow.type) {

                            if (currentWorkflow.previousId === null && currentWorkflow.nextId) {
                                const nextWorkflow = response.data.data.workflowStates.find((o: any) => o.id === currentWorkflow.nextId);
                                const _userInfo = workflows.find(o => o.wStateId === nextWorkflow.id);
                                setSendBtnUsername(_userInfo.userInfo.name);
                                setSendNextBtn({
                                    btnVisible: true,
                                    workflowName: `to ${nextWorkflow.roleName}`
                                });
                            }

                            if (currentWorkflow.previousId && currentWorkflow.nextId) {
                                const previousWorkflow = response.data.data.workflowStates.find((o: any) => o.id === currentWorkflow.previousId);
                                const nextWorkflow = response.data.data.workflowStates.find((o: any) => o.id === currentWorkflow.nextId);

                                const _nextuserInfo = workflows.find(o => o.wStateId === nextWorkflow.id);
                                setSendBtnUsername(_nextuserInfo.userInfo.name);

                                const _prevuserInfo = workflows.find(o => o.wStateId === previousWorkflow.id);
                                setSendPrevBtnUsername(_prevuserInfo)

                                setSendNextBtn({
                                    btnVisible: true,
                                    workflowName: `to ${nextWorkflow.roleName}`
                                });

                                setSendBackBtn({
                                    btnVisible: true,
                                    workflowName: `to ${previousWorkflow.roleName}`
                                })
                            }
                        }
                    }


                } else {
                    setSendNextBtn({
                        btnVisible: true,
                        workflowName: ''
                    });
                }


            }
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {

        setTocData([]);
        //setToggleChecked(permissions.type !== 'author');
        const init = async () => {

            const response = await getCourseDetailsbyId(courseId);

            if (response) {

                if (response.markasdone) {
                    const boolValue: boolean = response.markasdone === "true";
                    setToggleChecked(boolValue);
                };

                if (response.step) {
                    stepCurrentStep(response.step);

                    if (response.step === 'step_6') {
                        //setReadyOnly(true);
                        dispatch(setDisableBtnWhileScreaming(true));
                    }

                    getWorkflowStatesList(response.workflowStateId, response.workflows);

                }

                for await (const moudule of response.modules) {
                    //console.log(moudule);
                    await fetchModuleDetailsById(moudule.moduleId);
                }


            }
        }

        init();
    }, []);


    const _getTopicDetailsbyId = async (topicId: string): Promise<any | undefined> => {
        try {
            const response = await axiosInstance.get(`/topic/${topicId}`);

            if (response.status === 200) {
                if (response.data.data.pages && response.data.data.pages.length > 0) {
                    return { htmlContent: response.data.data.pages[0].htmlContent, pageId: response.data.data.pages[0].pageId, parentId: response.data.data.pages[0].parentId, node_id: response.data.data.pages[0].pageId };
                }
            }
        } catch (error) {
            console.log(error);
        }
    }

    const _getPageDetailsbyId = async (pageId: string): Promise<any | undefined> => {
        try {
            const repsonse = await axiosInstance.get(`/page/${pageId}`);

            if (repsonse.status === 200) {
                if (repsonse.data.data) {
                    return { htmlContent: repsonse.data.data.htmlContent, pageId: repsonse.data.data.pageId, parentId: repsonse.data.data.parentId };
                }
            }
        } catch (error) {
            console.log(error);
        }
    }

    const _getAssessmentDetailsbyId = async (assessmentId: string): Promise<any | undefined> => {
        try {
            const repsonse = await axiosInstance.get(`/assessment/${assessmentId}`);

            if (repsonse.status === 200) {
                return { htmlContent: repsonse.data.data.htmlContent, pageId: repsonse.data.data.assessmentId }
            }
        } catch (error) {
            console.log(error);
        }
    }

    const getInitials = (fullName: string): string => {
        if (fullName) {
            const names = fullName.trim().split(/\s+/);

            if (names.length === 1) {
                return names[0][0].toUpperCase();
            }

            return (names[0][0] + names[1][0]).toUpperCase();
        }
        return "";
    }

    const [_, forceUpdate] = useState(0);
    const contentRef = useRef<any>({});

    const isStreaming = useRef<boolean>(false);

    useEffect(() => {
        socket.on("connect", () => {
            console.log("Connected to WebSocket server");
        });

        socket.on("message", (data) => {
            //console.log("Received test:", data);

            if (data.is_complete) {
                setIsloading(false);
            }

            contentRef.current = {
                ...contentRef.current,
                ...data,
                ...{ isSteaming: true }
            };

            if (!isStreaming.current) {
                isStreaming.current = true;
            }

            forceUpdate(n => n + 1);
        });

        socket.on("disconnect", () => {
            console.log("Disconnected from WebSocket server");
        });

    }, [socket]);

    useEffect(() => {

        socket1Ref.current = io("https://dev-apicoursebuilder.dictera.com");
        //socket2Ref.current = io("http://44.225.186.7:3001/");

        const handleMessage = async (data: any) => {
            //console.log(data, "streaming content from backend");
            if (data.is_complete) {

                const currentStep = await getCourseDetailsbyId(courseId);
                if (currentStep && currentStep.step === 'step_4') {
                    stepCurrentStep(currentStep.step);
                    dispatch(clearDisableBtnWhileScreaming());
                }

                forceUpdate(n => n + 1);
            } /*else {
                   contentRef.current = {
                       ...contentRef.current,
                       ...data,
                       ...{ isSteaming: true }
                   };
   
                   forceUpdate(n => n + 1);
               } */

            contentRef.current = {
                ...contentRef.current,
                ...data,
                ...{ isSteaming: true }
            };

            if (!isStreaming.current) {
                isStreaming.current = true;
            }

            forceUpdate(n => n + 1);
        };

        socket1Ref.current.on('message', handleMessage);
        //socket2Ref.current.on('dsResponse', handleMessage);


        return () => {
            socket1Ref.current?.off('message', handleMessage);
            //socket2Ref.current?.off('dsResponse', handleMessage);
            //socket1Ref.current?.disconnect();
            //socket2Ref.current?.disconnect();      
        };
    }, [Socket]);

    useEffect(() => {
        const init = async () => {
            if (Object.keys(steamingContent).length > 0) {
                setActiveTopic(Object.keys(steamingContent)[0]);

                _activeTopic = Object.keys(steamingContent)[0];

                if (currentStep === 'step_3') {
                    dispatch(setDisableBtnWhileScreaming(true));
                    const [topicId, topic] = Object.entries(steamingContent)[0];

                    try {
                        const obj = topic.nodeType === 'page' ? await _getPageDetailsbyId(topicId) : steamingContent[topicId].nodeType === "assessment" ? await _getAssessmentDetailsbyId(topicId) : await _getTopicDetailsbyId(topicId);
                        if (obj) {
                            const data = {
                                "node_id": topicId,
                                "course_content": obj.htmlContent,
                                pageId: obj.pageId,
                                is_complete: true
                            };
                            contentRef.current = {
                                ...contentRef.current,
                                ...data,
                                ...{ isSteaming: false }
                            }

                            forceUpdate(n => n + 1);
                        }
                    } catch (error) {
                        console.log(error);
                    }
                    socket1Ref.current?.emit('streaming-content', { courseId: courseId, modules: unitModules });
                } else if (currentStep === 'step_4' || currentStep === 'step_5' || currentStep === 'step_6') {
                    if (currentStep === 'step_4') {
                        dispatch(clearDisableBtnWhileScreaming());
                    }

                    if (currentPermissions.type === 'reviewer') {
                        setToggleSuggestionChecked(true);
                        setTimeout(async () => {
                            if (editorRef.current) {
                                editorRef.current.alwaysEnbaleTrack();
                            }
                        }, 1000);
                    }

                    for await (const [topicId, value] of Object.entries(steamingContent)) {
                        const obj = value.nodeType === 'page'
                            ? await _getPageDetailsbyId(topicId) : value.nodeType === "assessment"
                                ? await _getAssessmentDetailsbyId(topicId) : await _getTopicDetailsbyId(topicId);
                        if (obj) {
                            if (value.parentId === undefined) {
                                steamingContent[topicId].parentId = obj.parentId;
                                steamingContent[topicId].node_id = obj.node_id;
                            };
                            const data = {
                                "node_id": topicId,
                                "course_content": obj.htmlContent,
                                pageId: obj.pageId,
                                is_complete: true
                            };
                            contentRef.current = {
                                ...contentRef.current,
                                ...data,
                                ...{ isSteaming: false }
                            }

                            //updateStreamingTopic(topicId, data);

                            forceUpdate(n => n + 1);
                        }
                    }

                }

            }
        }

        if (isReadyEditor) init();

    }, [steamingContent, isReadyEditor]);

    useEffect(() => {
        if (isSaved) {
            const timer = setTimeout(() => setSaved(false), 3000); // 2 seconds
            return () => clearTimeout(timer); // cleanup
        }

        if (showToast) {
            const timer = setTimeout(() => setShowToast(false), 2000); // 2 seconds
            return () => clearTimeout(timer); // cleanup
        }
    }, [isSaved, showToast]);
    //#endregion stream startup

    useEffect(() => {
        setReadyOnly(isToggleChecked);
        dispatch(setDisableBtnWhileScreaming(isToggleChecked));
        setDisableMarkAsDone(isToggleChecked);
        //setReadyOnly(isToggleChecked);
        if (editorRef.current) {
            editorRef.current.toggleReadOnly(isToggleChecked);
        }
    }, [isToggleChecked])

    useEffect(() => {
        dispatch(setTitle('Design your course...'));
        dispatch(setBreadCrumb(['Projects', project.title, courseName]));
    }, [])

    return (
        <section className="flex flex-col h-[calc(100vh-102px)]">
            <div className="grid grid-cols-[4%,1fr] gap-3 h-screen">
                <div>
                    {/* <Toolbars onInsertTemplate={(templateHTML: string) => handleInsertTemplate(templateHTML)} /> */}
                    <Toolbars onInsertTemplate={(template: string) => handleInsertTemplate(template)} />
                </div>
                <div className="bg-white border border-gray-200 rounded-[16px] shadow-[rgba(17,_17,_26,_0.1)_0px_0px_16px] py-3 px-5 mb-2">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-xl font-semibold inline-flex items-center gap-2">
                            {courseName}
                            {isSaved &&
                                <>
                                    <img src={Icons.check_saved_icon} alt="check_saved_icon" />
                                    <span className="text-[#40444D] text-sm font-normal">Saved</span>
                                </>
                            }
                        </h1>
                        <div className="flex gap-2">
                            {/* {hasPermissionCanAuthor.autoGenerateContentUsingAI && <button
                                type="button"
                                onClick={() => setRegeneratewithAIModal(!isRegeneratewithAIModal)}
                                className={`${disableBtnWhileScreaming ? 'bg-gray-200 text-gray-400' : 'text-[#4318FF] bg-white border-[#4318FF]'}  font-bold border  
                                    focus:outline-none hover:bg-gray-200 focus:ring-1 focus:ring-[#4318FF] 
                                    rounded-full text-base px-4 py-2 me-4`}
                            //disabled={disableBtnWhileScreaming}
                            >
                                <img className="inline-block me-2 w-[18.33px] align-top" src={Icons.magic_wand_auto_fix_button} alt="gen_ai_icon.svg" />
                                Regenerate with AI
                            </button>} */}

                            {permissions.AutoGeneratecontentusingAI && <button
                                type="button"
                                onClick={() => setRegeneratewithAIModal(!isRegeneratewithAIModal)}
                                className={`${disableBtnWhileScreaming ? 'bg-gray-200 text-gray-400' : 'text-[#4318FF] bg-white border-[#4318FF]'}  font-bold border  
                                    focus:outline-none hover:bg-gray-200 focus:ring-1 focus:ring-[#4318FF] 
                                    rounded-full text-base px-4 py-2 me-4`}
                                disabled={disableBtnWhileScreaming}
                            >
                                <img className="inline-block me-2 w-[18.33px] align-top" src={Icons.magic_wand_auto_fix_button} alt="gen_ai_icon.svg" />
                                Regenerate with AI
                            </button>}


                            <button
                                type="button"
                                onClick={() => handleSave()}
                                className={`font-bold rounded-full text-base px-10 py-2.5 text-center 
                                    ${disableBtnWhileScreaming ? 'bg-gray-200 text-gray-400' : 'bg-[linear-gradient(135deg,_#868CFF_0%,_#4318FF_100%)] text-white hover:bg-[linear-gradient(135deg,_#6A7FFF_0%,_#2A1CFF_100%)]'}  
                                    
                                    focus:ring-1 focus:ring-blue-300 mr-2`}
                                disabled={disableBtnWhileScreaming}
                            >
                                Save
                            </button>

                            <DotDropdownMenu
                                onSelectedMenu={(menu: string) => handleSelectedMenu(menu)}
                                hasPremission={permissions}
                                sendNext={showSendNextBtn}
                                sendBack={showSendBackBtn}
                                onSendDisabled={isToggleChecked}
                            />

                        </div>
                    </div>
                    <hr className="border-t border-[#F2F4FF] my-4" />
                    <div className="flex justify-between items-center mb-2">
                        <div>
                            <a className="cursor-pointer flex items-center gap-2" onClick={() => {
                                //if (!disableMarkAsDone) {
                                setCollapseToc(!collapseToc)
                                //};
                            }}>
                                {!collapseToc ?
                                    <img src={Icons.left_toc_arrow} alt="left_toc_arrow.svg" />
                                    :
                                    <img src={Icons.toc_burger} alt="toc_burger.svg" />
                                }
                                {/* <span className="text-base font-bold">Course units</span> */}
                            </a>
                        </div>
                        <div className="flex gap-3 items-center">
                            <button
                                className="text-[#4318FF] text-sm font-semibold mr-1"
                                onClick={() => setLOIsModalOpen(true)}
                            >
                                View course learning outcomes
                            </button>

                            {/* Vertical Line Divider */}
                            <div className="h-5 w-[1px] bg-gray-300"></div>

                            <img className="inline" src={Icons.exclamation_mark} alt="exclamation_mark.svg" />

                            {<label className="relative inline-flex cursor-pointer items-center h-4">
                                <input
                                    id="switch-1"
                                    type="checkbox"
                                    className="peer sr-only"
                                    checked={isToggleChecked}
                                    onChange={handleToggleChange}
                                //disabled={disableBtnWhileScreaming}
                                />
                                <label htmlFor="switch-1" className="hidden"></label>
                                <div className="peer h-4 w-11 rounded-full border bg-slate-200 after:absolute after:-top-1 after:left-0 after:h-6 after:w-6 after:rounded-full after:border after:shadow-sm after:bg-white after:transition-all after:content-[''] peer-checked:after:bg-[#4318FF] peer-checked:bg-[#4318FF] peer-checked:bg-opacity-[50%] peer-checked:after:translate-x-full peer-focus:ring-[#4318FF]"
                                ></div>
                                <span className="ms-3 text-[14px] font-normal">Mark as done</span>
                            </label>}

                            <div>
                                <DropdownMenu />
                            </div>
                        </div>
                    </div>

                    <div className={`grid ${!collapseToc ? 'grid-cols-[20%,1fr,3%]' : 'grid-cols-[1fr,30%]'} mt-4 h-[83%] gap-4`}>
                        {!collapseToc && <div>
                            {permissions.ViewCourseTOC &&
                                <>
                                    <span className="text-base font-bold">Course units</span>
                                    <TOCAccordion item={tocData} onChange={(topicId: string) => getTopicDetailsbyId(topicId)} />
                                </>
                            }
                        </div>}
                        {<div className="relative">
                            {permissions.ViewCoursecontent &&
                                <EditorLayout
                                    ref={editorRef}
                                    streamingContent={steamingContent}
                                    activeTopic={activeTopic}
                                    data={contentRef.current}
                                    hasPermission={permissions}
                                    onIsReadyEditor={(isReady: boolean) => setReadyEditor(isReady)}
                                    onGetAllChanges={(tracks: any[]) => {
                                        tracks.forEach(track => {
                                            track.replies = [{
                                                text: "",
                                                addedDateTime: ""
                                            }];
                                        })

                                        setTrackChangesList(prevData => {
                                            const uniqueTracks = tracks.filter(newTrack =>
                                                !prevData.some(existingTrack =>
                                                    existingTrack.type === newTrack.type &&
                                                    existingTrack.timestamp === newTrack.timestamp
                                                )
                                            );

                                            if (uniqueTracks.length === 0) {
                                                console.log("All tracks already exist. Skipping update.");
                                                return prevData;
                                            }

                                            return [...prevData, ...uniqueTracks];
                                        });

                                        setTimeout(() => {
                                            const scrollDiv = document.querySelector('#trackChangeCardView');

                                            if (scrollDiv) {
                                                scrollDiv.scrollTo({ top: scrollDiv.scrollHeight, behavior: "smooth" });
                                            }
                                        }, 100);

                                    }}
                                    onOpenBugsDialog={() => {
                                        setCollapseToc(true);
                                        setActiveSideTab('tab-1');
                                        retriveAllbugsList();
                                        //setBugOptionShow(true);
                                        //handleOpenBugModal();
                                        setOpenBugsModal(true);
                                    }}
                                    onOpenCommentsDialog={() => {
                                        setCollapseToc(true);
                                        setActiveSideTab('tab-3');
                                        retriveAllcommentsList();
                                        setOpenCommentModal(true);
                                    }}
                                    onEnableTracking={() => {
                                        //setToggleSuggestionChecked(!isToggleSuggestionChecked);
                                        //handleSuggestionToggleChange(true);
                                        setCollapseToc(true);
                                        setActiveSideTab('tab-5');
                                        retriveAllTrackList();
                                    }}
                                    onRegenContentAI={(_htmlContent) => {
                                        setInputHtmlContent(_htmlContent);
                                        setOpenRegenContentAI(!isOpenRegenContentAI);
                                    }}
                                    onAutoSave={(autoSave: boolean) => {/* handleSave(autoSave) */ }}
                                    readOnly={isReadyOnly}
                                />}
                        </div>}

                        {/* rework */}

                        {collapseToc && <div className="bg-white border border-gray-200 rounded-[16px] shadow-[rgba(17,_17,_26,_0.1)_0px_0px_16px] px-4 py-2 h-[95%]">
                            <div className="relative max-w-3xl h-[60px] flex items-center mb-4" style={{ 'borderBottom': '1px solid #e3e4e9' }}>
                                {showLeftArrow && (
                                    <button
                                        onClick={() => scroll('left')}
                                        className="absolute left-0 top-1/2 -translate-y-1/2 p-1 rounded overflow-hidden shadow-lg z-10"
                                        aria-label="Scroll left"
                                    >
                                        <img className="rotate-180" src={Icons.scroll_arrow_icon} alt="scroll_arrow_icon.svg" />
                                    </button>
                                )}

                                <div
                                    className="overflow-x-hidden relative"
                                    ref={scrollContainerRef}
                                    onScroll={handleScroll}
                                >
                                    <ul className="flex flex-nowrap text-sm text-center gap-2">
                                        <li>
                                            <button
                                                onClick={() => {
                                                    setActiveSideTab('tab-1');
                                                    retriveAllbugsList();
                                                }}
                                                className={`inline-block text-[#2B3674] px-2 py-1 text-[14px] text-center ${activeSideTab === 'tab-1' && "text-white bg-[#4318FF]"} text-black rounded`}
                                                aria-current="page"
                                            >
                                                Bugs
                                            </button>
                                        </li>
                                        {/* <li>
                                            <button
                                                onClick={() => setActiveSideTab('tab-2')}
                                                className={`inline-block text-[#2B3674] px-2 py-1 text-[14px] text-center whitespace-nowrap ${activeSideTab === 'tab-2' && "text-white bg-[#4318FF]"} text-black rounded`}
                                            >
                                                Quality check
                                            </button>
                                        </li> */}
                                        <li>
                                            <button
                                                onClick={() => {
                                                    setActiveSideTab('tab-3');
                                                    retriveAllcommentsList();
                                                }}
                                                className={`inline-block text-[#2B3674] px-2 py-1 text-[14px] text-center whitespace-nowrap ${activeSideTab === 'tab-3' && "text-white bg-[#4318FF]"} text-black rounded`}
                                            >
                                                Comments
                                            </button>
                                        </li>
                                        {/* {permissions.AddMetaTags &&<li>
                                            <button
                                                onClick={() => setActiveSideTab('tab-4')}
                                                className={`inline-block text-[#2B3674] px-2 py-1 text-[14px] text-center whitespace-nowrap ${activeSideTab === 'tab-4' && "text-white bg-[#4318FF]"} text-black rounded`}
                                            >
                                                Meta tags
                                            </button>
                                        </li>} */}
                                        <li>
                                            <button
                                                onClick={() => {
                                                    setActiveSideTab('tab-5');
                                                    retriveAllTrackList();
                                                }}
                                                className={`inline-block text-[#2B3674] px-2 py-1 text-[14px] text-center whitespace-nowrap ${activeSideTab === 'tab-5' && "text-white bg-[#4318FF]"} text-black rounded`}
                                            >
                                                Track change
                                            </button>
                                        </li>
                                        {/*  <li>
                                            <button
                                                onClick={() => setActiveSideTab('tab-6')}
                                                className={`inline-block text-[#2B3674] px-2 py-1 text-[14px] text-center whitespace-nowrap ${activeSideTab === 'tab-6' && "text-white bg-[#4318FF]"} text-black rounded`}
                                            >
                                                Style guide
                                            </button>
                                        </li> */}
                                    </ul>

                                </div>

                                {showRightArrow && (
                                    <button
                                        onClick={() => scroll('right')}
                                        className="absolute right-0 top-1/2 -translate-y-1/2 rounded overflow-hidden shadow-lg z-10"
                                        aria-label="Scroll right"
                                    >
                                        <img src={Icons.scroll_arrow_icon} alt="scroll_arrow_icon.svg" />
                                    </button>
                                )}
                            </div>

                            <div className={`${activeSideTab === 'tab-1' ? 'block' : 'hidden'} h-[82%]`}>
                                {!isBugOptionShow &&
                                    <>

                                        {
                                            bugsList.length > 0
                                                ?
                                                <>
                                                    <div className="flex justify-between rounded-md shadow-sm mt-6 mb-6" role="group">
                                                        <div>
                                                            <button onClick={() => handleBugStateChange('open')} type="button" className={`px-4 py-2 text-sm font-medium  rounded-s-lg  ${activeBugState === 'open' ? 'text-white bg-[#4318FF]' : ''}`}>
                                                                Open
                                                            </button>
                                                            <button onClick={() => handleBugStateChange('resolved')} type="button" className={`px-4 py-2 text-sm font-medium rounded-e-lg  ${activeBugState === 'resolved' ? 'text-white bg-[#4318FF]' : ''}`}>
                                                                Resolved
                                                            </button>
                                                        </div>

                                                    </div>
                                                    {!isBugDetailShow ?

                                                        <div className="overflow-auto scrollbar-gray h-[300px] pe-2">
                                                            {bugsList.filter(o => o.resolved === activeBugState).map((bug, index) => (
                                                                <div key={index} onClick={(e) => {
                                                                    const target = e.target as HTMLElement;
                                                                    if (target.closest('.ignore-btn')) return;
                                                                    handleBugDetail(bug);
                                                                }} className="bg-white border border-gray-200 rounded-[14px] shadow-[0px_6px_24px_0px_#0000000D] p-2 mb-4 cursor-pointer">

                                                                    <div className="flex py-2">
                                                                        <div className="inline-flex items-center justify-center w-[35px] h-[35px] rounded-full bg-[#C0CAFF] text-[#2B3674] font-bold text-sm mx-2">
                                                                            {getInitials(bug.user)}
                                                                        </div>
                                                                        <div className="flex-grow">
                                                                            <div className="flex justify-between">
                                                                                <span className="text-sm text-[#40444D] font-semibold">{bug.user} <br /> <span className="text-xs font-normal text-[#8D95A4]">{bug.addedDateTime}</span></span>
                                                                                <span><button className='delete-btn w-[14px] ignore-btn' onClick={() => handleDeleteBug(bug.id)}><img src={Icons.red_delete_icon} alt="red_delete_icon.svg" /></button></span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="p-2 my-1">
                                                                        <p className="text-sm">Bug: <span className="bg-[#FFF0F0] p-2 rounded-lg ms-1 font-medium">{bug.bugType}</span></p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        :
                                                        <div className="h-[82%]">
                                                            <p className="mt-2 mb-4 text-sm"><a className="cursor-pointer ignore-btn" onClick={handleBackList}><img className="inline me-2" src={Icons.back_arrow_icon} alt="right_arrow.svg" /> Back to bug list</a></p>
                                                            <div className="relative p-2 shadow-[0px_0px_0px_1px_#00000014,0px_6px_24px_0px_#0000000D] rounded-lg h-[89%]">
                                                                <div className="">
                                                                    <div className="flex py-2">
                                                                        <div className="inline-flex items-center justify-center w-[35px] h-[35px] rounded-full bg-[#C0CAFF] text-[#2B3674] font-bold text-sm mx-2">
                                                                            {getInitials(repliesList.user)}
                                                                        </div>
                                                                        <div className="flex-grow">
                                                                            <div className="flex justify-between">
                                                                                <span className="text-sm text-[#40444D] font-semibold">{repliesList.user} <br /> <span className="text-xs font-normal text-[#8D95A4]">{repliesList.addedDateTime}</span></span>
                                                                                {permissions.Changestatusofbugs && <label className="relative inline-flex cursor-pointer items-center h-4">
                                                                                    <input id="switch-1" type="checkbox" className="peer sr-only"
                                                                                        checked={isToggleBugChecked}
                                                                                        onChange={(e) => handleBugToggleChange(e, repliesList.id)} />
                                                                                    <label htmlFor="switch-1" className="hidden"></label>
                                                                                    <div className="peer h-4 w-11 rounded-full border bg-slate-200 after:absolute after:-top-1 after:left-0 after:h-6 after:w-6 after:rounded-full after:border after:shadow-sm after:bg-white after:transition-all after:content-[''] peer-checked:after:bg-[#4318FF] peer-checked:bg-[#4318FF] peer-checked:bg-opacity-[50%] peer-checked:after:translate-x-full peer-focus:ring-[#4318FF]"></div>
                                                                                    <span className="ms-3 text-sm">
                                                                                        Resolved
                                                                                    </span>
                                                                                </label>}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="h-[66%] relative">
                                                                    <div id="bugReplies" className={`mb-2 overflow-auto scrollbar-gray ${permissions.Addcommentsforbugs ? 'h-[154px]' : 'h-[180px]'}`}>
                                                                        <p className="text-sm my-2">Bug: <span className="bg-[#FFF0F0] p-2 rounded-lg ms-1 font-medium">{repliesList.bugType}</span></p>
                                                                        <h6 className="text-sm my-2">Bug description</h6>
                                                                        <p className="text-sm">{repliesList.text}</p>
                                                                        {repliesList.replies.map((reply: any, index: number) => (
                                                                            <div className="mt-4 mb-2 me-1" key={index}>
                                                                                <p className="text-right text-[#8D95A4] text-xs mb-4">{reply.addedDateTime}</p>
                                                                                <p className="text-sm text-[#40444D] bg-[#F2F4FF] shadow-lg rounded-lg  p-2">{reply.text}</p>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                    {permissions.Addcommentsforbugs && <div className="absolute -bottom-[30px] w-full">
                                                                        <input
                                                                            type="text"
                                                                            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pe-10 p-2.5"
                                                                            placeholder="Reply"
                                                                            value={inputBugText}
                                                                            onChange={(e) => setInputBugText(e.target.value)}
                                                                            onKeyDown={(e) => {
                                                                                if (e.key === "Enter") {
                                                                                    e.preventDefault();
                                                                                    handleBugAddReply(repliesList);
                                                                                }
                                                                            }}
                                                                        />

                                                                        <button onClick={() => handleBugAddReply(repliesList)} className="absolute inset-y-0 end-0 flex items-center pe-3.5 cursor-pointer">
                                                                            <img src={Icons.reply_buton} alt="reply_buton.svg" />
                                                                        </button>
                                                                    </div>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    }

                                                </>
                                                :
                                                <div>
                                                    <p className="p-1 mt-4 mb-4 text-sm bg-[#F2F4FF80]"><img className="inline align-text-bottom me-1" src={Images.exclamation_mark_1} alt="" /> Report and track issues or errors that need fixing.</p>

                                                    <div className="relative flex-1 mb-4">
                                                        <input
                                                            type="text"
                                                            placeholder="Search"
                                                            //value={searchQuery}
                                                            //onChange={(e) => handleSearch(e)}
                                                            className="w-full pl-4 pr-10 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-1"
                                                        />

                                                        <img className="absolute right-3 top-3 text-gray-400 w-4 h-4" src={Icons.p_search_icon} alt="p_search_icon.svg" />
                                                    </div>

                                                    {/* <RadioButtonGroup /> */}

                                                    <div className="mt-4 w-full text-[#2B3674] space-y-2 text-sm">
                                                        {bugsTypes.map((bugsType: string, index: number) => (
                                                            <a href="#" key={index} onClick={() => handleOpenBugModal(bugsType)} className="block bg-[#F2F4FF] p-2 cursor-pointer hover:bg-gray-100 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:text-blue-700">
                                                                <img className="inline me-2 align-[-1]" src={Icons.bullet_icon} alt="bullet_icon.svg" /> {bugsType}
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                        }
                                    </>
                                }
                            </div>

                            <div className={`${activeSideTab === 'tab-3' ? 'block' : 'hidden'} h-[82%]`}>
                                {commentList.length > 0 ?
                                    <div id="commendReplies" className={`overflow-auto scrollbar ${isCommentReplyShow ? 'h-[330px]' : 'h-[370px]'} mt-4`}>
                                        {!isCommentReplyShow ?
                                            <>
                                                {commentList.map((comment, index) => (
                                                    <React.Fragment key={index}>
                                                        <div onClick={(e) => {
                                                            const target = e.target as HTMLElement;
                                                            if (target.closest('.delete-btn')) return;

                                                            handleShowRepiles(comment);
                                                        }} className="bg-white border border-gray-200 rounded-[14px] shadow-[0px_6px_24px_0px_#0000000D] p-2 me-2 mb-4 cursor-pointer">
                                                            <div className="flex py-2">
                                                                <div className="inline-flex items-center justify-center w-[35px] h-[35px] rounded-full bg-[#C0CAFF] text-[#2B3674] font-bold text-sm mx-2">
                                                                    {getInitials(comment.user)}
                                                                </div>
                                                                <div className="flex-grow">
                                                                    <div className="flex justify-between">
                                                                        <span className="text-sm text-[#40444D] font-semibold">{comment.user} <br /> <span className="text-xs font-normal text-[#8D95A4]">{comment.addedDateTime}</span></span>
                                                                        <span><button className='delete-btn w-[14px]' onClick={() => handleDeleteComment(comment.id)}><img src={Icons.red_delete_icon} alt="red_delete_icon.svg" /></button></span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="p-2 my-1">
                                                                <p className="text-sm truncate w-[320px]">{comment.text}</p>
                                                            </div>
                                                        </div>
                                                    </React.Fragment>
                                                ))}
                                            </>
                                            : <div className="me-2 mb-3">
                                                <p className="mt-2 mb-4 text-sm"><a className="cursor-pointer" onClick={() => setCommentReplyShow(false)}><img className="inline me-2" src={Icons.back_arrow_icon} alt="right_arrow.svg" /> Back to comment list</a></p>
                                                <div className="flex px-0 py-2 gap-1">
                                                    <div className="inline-flex items-center justify-center w-[35px] h-[35px] rounded-full bg-[#C0CAFF] text-[#2B3674] font-bold text-sm">
                                                        JS
                                                    </div>
                                                    <div className="flex-grow">
                                                        <p className="text-sm text-[#40444D] font-semibold">{repliesList.user} <br /> <span className="text-xs font-normal text-[#8D95A4]">{repliesList.addedDateTime}</span></p>
                                                    </div>
                                                </div>
                                                <div className="p-2 shadow-lg rounded-xl">
                                                    <p className="text-sm text-[#40444D]">{repliesList.text}</p>
                                                </div>
                                                {repliesList.replies.map((reply: any, index: number) => (
                                                    <div className="mt-4" key={index}>
                                                        <p className="text-right text-[#8D95A4] text-xs mb-4">{reply.addedDateTime}</p>
                                                        <p className="text-sm text-[#40444D] bg-[#F2F4FF] shadow-lg rounded-lg  p-2">{reply.text}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        }
                                    </div>
                                    :
                                    <>
                                        <p className="p-1 mt-4 mb-2 text-sm bg-[#F2F4FF80]"><img className="inline align-text-bottom me-1" src={Images.exclamation_mark_1} alt="" /> Leave feedback or notes for collaboration.</p>
                                        <div className="flex items-center justify-center h-80 mt-3 flex-col">
                                            <img src={Images.comments_1} alt="comments_1.svg" />
                                            <p className="font-bold mt-2">Start the discussion!</p>
                                        </div>
                                    </>}
                                {isCommentReplyShow &&
                                    <form className="border-t" onSubmit={handleSubmit}>
                                        <div className="flex">
                                            <input
                                                type="text"
                                                className="border-none block flex-1 min-w-0 w-full text-sm p-2"
                                                placeholder="Type message..."
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                            />
                                            <button className="inline-flex items-center" type="submit" disabled={!message.trim()}>
                                                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <rect width="32" height="32" rx="16" fill="url(#paint0_linear_3099_35641)" />
                                                    <path d="M20.6959 11.1659L11.0922 15.1542C10.4368 15.4377 10.4406 15.8314 10.9719 16.007L13.4376 16.8354L19.1424 12.9591C19.4122 12.7824 19.6586 12.8774 19.4561 13.0711L14.834 17.5634H14.8329L14.834 17.5639L14.6639 20.3009C14.9131 20.3009 15.0231 20.1779 15.1628 20.0326L16.3604 18.7784L18.8516 20.76C19.3109 21.0324 19.6408 20.8924 19.7551 20.3021L21.3903 12.0024C21.5577 11.2797 21.1341 10.9524 20.6959 11.1659Z" fill="white" />
                                                    <defs>
                                                        <linearGradient id="paint0_linear_3099_35641" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                                                            <stop stopColor="#868CFF" />
                                                            <stop offset="1" stopColor="#4318FF" />
                                                        </linearGradient>
                                                    </defs>
                                                </svg>

                                            </button>
                                        </div>
                                    </form>
                                }
                            </div>

                            <div className={`${activeSideTab === 'tab-5' ? 'block' : 'hidden'} h-[82%]`}>
                                <p className="p-1 mt-4 mb-4 text-sm bg-[#F2F4FF80]"><img className="inline align-text-bottom me-1" src={Images.exclamation_mark_1} alt="" /> Enable tracking of edits and highlight all changes.</p>

                                {permissions.Addnewsuggestions && <label className="relative inline-flex cursor-pointer items-center h-4 mb-4">
                                    <input id="switch-1" type="checkbox" className="peer sr-only"
                                        checked={isToggleSuggestionChecked}
                                        onChange={(e) => handleSuggestionToggleChange(e.target.checked)}
                                        disabled={permissions.Addnewsuggestions}
                                    />
                                    <label htmlFor="switch-1" className="hidden"></label>
                                    <div className="peer h-4 w-11 rounded-full border bg-slate-200 after:absolute after:-top-1 after:left-0 after:h-6 after:w-6 after:rounded-full after:border after:shadow-sm after:bg-white after:transition-all after:content-[''] peer-checked:after:bg-[#4318FF] peer-checked:bg-[#4318FF] peer-checked:bg-opacity-[50%] peer-checked:after:translate-x-full peer-focus:ring-[#4318FF]"></div>
                                    <span className="ms-3 text-sm">
                                        Suggestion mode
                                    </span>
                                </label>}

                                {trackChangeList.length > 0 ?
                                    <div id="trackChangeCardView" className="overflow-auto scrollbar h-[281px] mt-2">
                                        {trackChangeList.map((track: any, index: number) => (
                                            <React.Fragment key={index}>
                                                <div onClick={(e) => {
                                                    const target = e.target as HTMLElement;
                                                    if (target.closest('.delete-btn')) return;

                                                    editorRef.current?.scrollToTrack(track.timestamp);
                                                }} className="bg-white border border-gray-200 rounded-[14px] shadow-[0px_6px_24px_0px_#0000000D] p-2 me-2 mb-4 cursor-pointer">
                                                    <div className="flex py-2">
                                                        <div className="inline-flex items-center justify-center w-[35px] h-[35px] rounded-full bg-[#C0CAFF] text-[#2B3674] font-bold text-sm mx-2">
                                                            {getInitials(track.user)}
                                                        </div>
                                                        <div className="flex-grow">
                                                            <div className="flex justify-between">
                                                                <span className="text-sm text-[#40444D] font-semibold">{track.user} <br /> <span className="text-xs font-normal text-[#8D95A4]">{formatTimestamp(track.timestamp)}</span></span>
                                                                {/* <span><button className='delete-btn w-[14px]' onClick={() => handleDeleteComment(track.timestamp)}><img src={Icons.red_delete_icon} alt="red_delete_icon.svg" /></button></span> */}
                                                                {permissions.Acceptorrejectsuggestions && <div className="flex gap-4 me-2">
                                                                    <button className='delete-btn w-[14px]' onClick={() => handleRejectChange(track.timestamp)}>
                                                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                            <path d="M10 11.4L12.9 14.3C13.0833 14.4833 13.3167 14.575 13.6 14.575C13.8833 14.575 14.1167 14.4833 14.3 14.3C14.4833 14.1167 14.575 13.8833 14.575 13.6C14.575 13.3167 14.4833 13.0833 14.3 12.9L11.4 10L14.3 7.1C14.4833 6.91667 14.575 6.68333 14.575 6.4C14.575 6.11667 14.4833 5.88333 14.3 5.7C14.1167 5.51667 13.8833 5.425 13.6 5.425C13.3167 5.425 13.0833 5.51667 12.9 5.7L10 8.6L7.1 5.7C6.91667 5.51667 6.68333 5.425 6.4 5.425C6.11667 5.425 5.88333 5.51667 5.7 5.7C5.51667 5.88333 5.425 6.11667 5.425 6.4C5.425 6.68333 5.51667 6.91667 5.7 7.1L8.6 10L5.7 12.9C5.51667 13.0833 5.425 13.3167 5.425 13.6C5.425 13.8833 5.51667 14.1167 5.7 14.3C5.88333 14.4833 6.11667 14.575 6.4 14.575C6.68333 14.575 6.91667 14.4833 7.1 14.3L10 11.4ZM10 20C8.61667 20 7.31667 19.7375 6.1 19.2125C4.88333 18.6875 3.825 17.975 2.925 17.075C2.025 16.175 1.3125 15.1167 0.7875 13.9C0.2625 12.6833 0 11.3833 0 10C0 8.61667 0.2625 7.31667 0.7875 6.1C1.3125 4.88333 2.025 3.825 2.925 2.925C3.825 2.025 4.88333 1.3125 6.1 0.7875C7.31667 0.2625 8.61667 0 10 0C11.3833 0 12.6833 0.2625 13.9 0.7875C15.1167 1.3125 16.175 2.025 17.075 2.925C17.975 3.825 18.6875 4.88333 19.2125 6.1C19.7375 7.31667 20 8.61667 20 10C20 11.3833 19.7375 12.6833 19.2125 13.9C18.6875 15.1167 17.975 16.175 17.075 17.075C16.175 17.975 15.1167 18.6875 13.9 19.2125C12.6833 19.7375 11.3833 20 10 20Z" fill="#F7292D" />
                                                                        </svg>
                                                                    </button>
                                                                    <button className='delete-btn w-[14px]' onClick={() => handleAcceptChange(track.timestamp)}>
                                                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                            <path d="M8.6 11.8L6.45 9.65C6.26667 9.46667 6.03333 9.375 5.75 9.375C5.46667 9.375 5.23333 9.46667 5.05 9.65C4.86667 9.83333 4.775 10.0667 4.775 10.35C4.775 10.6333 4.86667 10.8667 5.05 11.05L7.9 13.9C8.1 14.1 8.33333 14.2 8.6 14.2C8.86667 14.2 9.1 14.1 9.3 13.9L14.95 8.25C15.1333 8.06667 15.225 7.83333 15.225 7.55C15.225 7.26667 15.1333 7.03333 14.95 6.85C14.7667 6.66667 14.5333 6.575 14.25 6.575C13.9667 6.575 13.7333 6.66667 13.55 6.85L8.6 11.8ZM10 20C8.61667 20 7.31667 19.7375 6.1 19.2125C4.88333 18.6875 3.825 17.975 2.925 17.075C2.025 16.175 1.3125 15.1167 0.7875 13.9C0.2625 12.6833 0 11.3833 0 10C0 8.61667 0.2625 7.31667 0.7875 6.1C1.3125 4.88333 2.025 3.825 2.925 2.925C3.825 2.025 4.88333 1.3125 6.1 0.7875C7.31667 0.2625 8.61667 0 10 0C11.3833 0 12.6833 0.2625 13.9 0.7875C15.1167 1.3125 16.175 2.025 17.075 2.925C17.975 3.825 18.6875 4.88333 19.2125 6.1C19.7375 7.31667 20 8.61667 20 10C20 11.3833 19.7375 12.6833 19.2125 13.9C18.6875 15.1167 17.975 16.175 17.075 17.075C16.175 17.975 15.1167 18.6875 13.9 19.2125C12.6833 19.7375 11.3833 20 10 20Z" fill="#05AB0B" />
                                                                        </svg>
                                                                    </button>
                                                                </div>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="p-2 my-1">
                                                        <p className="text-sm">
                                                            {/* <span className={`${track.type === 'deletion' ? 'deletion' : 'insertion'}`}>{toCapitalCase(track.type)}</span> */}
                                                            <span className="font-normal">{(track.type === 'deletion' ? 'Deleted' : 'Add')}: </span>
                                                            {track.text}
                                                        </p>
                                                    </div>
                                                    <div id={`trackReplies-${index}`} className="overflow-auto max-h-[80px] scrollbar-gray pe-2 pb-2">
                                                        {track.replies.map((reply: any, index: number) => (
                                                            <React.Fragment key={index}>
                                                                {(reply.text !== '' && reply.addedDateTime !== '') && <div className="mt-4" key={index}>
                                                                    {/* <p className="text-right text-[#8D95A4] text-xs mb-1">{reply.}</p> */}
                                                                    <p className="text-right text-[#8D95A4] text-xs mb-1">{reply.addedDateTime}</p>
                                                                    <p className="text-sm text-[#40444D] bg-[#F2F4FF] shadow-lg rounded-lg  p-2">{reply.text}</p>
                                                                </div>}
                                                            </React.Fragment>
                                                        ))}
                                                    </div>
                                                    {permissions.Replytosuggestions && <div className="relative mt-2">
                                                        <input
                                                            type="text"
                                                            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pe-10 p-2.5"
                                                            placeholder="Reply"
                                                            value={trackInputs[track.timestamp] || ""}
                                                            onChange={(e) => handleTrackInputChange(track.timestamp, e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === "Enter") {
                                                                    e.preventDefault();
                                                                    handleTrackAdd(track, `trackReplies-${index}`);
                                                                }
                                                            }}
                                                        />

                                                        <button onClick={() => handleTrackAdd(track, `trackReplies-${index}`)} className="absolute inset-y-0 end-0 flex items-center pe-3.5 cursor-pointer">
                                                            <img src={Icons.reply_buton} alt="reply_buton.svg" />
                                                        </button>
                                                    </div>}
                                                </div>
                                            </React.Fragment>
                                        ))}
                                    </div>
                                    :
                                    <div className="flex items-center justify-center h-[75%] flex-col">

                                        <p className="font-bold mt-2">No changes has been added yet.</p>
                                    </div>
                                }

                            </div>

                        </div>}
                        {/* rework */}

                        {!collapseToc && <div className="bg-white border border-gray-200 rounded-[16px] shadow-[rgba(17,_17,_26,_0.1)_0px_0px_16px] h-[260px]">
                            <RightToolbar onOpenTab={(tab: string) => handleOpenTab(tab)} />
                        </div>}

                    </div>
                </div>
            </div>
            <CommentModal isOpen={isOpenCommentModal} onClose={() => setOpenCommentModal(false)} onSubmit={(comment: string) => handleAddComment(comment)} />
            <BugsModal isOpen={isOpenBugsModal} onClose={() => setOpenBugsModal(false)} onSubmit={(bug: string, bugType: string) => handleAddBug(bug, bugType)} />
            <RegenContentAIFullModal isOpen={isRegeneratewithAIModal} onClose={() => setRegeneratewithAIModal(!isRegeneratewithAIModal)} onSubmit={(prompt: string) => handleRegeneratewithAI(prompt)} />
            <RegenContentAIModal inputHtmlContent={inputHtmlContent} isOpen={isOpenRegenContentAI} onClose={() => setOpenRegenContentAI(!isOpenRegenContentAI)} onSubmit={(prompt: string) => handleSpecificRegeneratewithAI(prompt)} />
            <CourseLOModal isOpen={isLOModalOpen} onClose={() => setLOIsModalOpen(false)} tocData={tocData} />
            <Preview tocData={tocData} isOpen={isShowPreview} onClose={() => setShowPreview(false)} />
            {showPlublish && <Publish onShowPublish={() => setShowPublish(false)} onIsloader={(state: boolean): void => setIsloading(state)} />}
            {showToast && (<Toast message="Your changes have been saved successfully!" onClose={() => setShowToast(!showToast)} />)}
            <Spinner isLoading={isLoading} />
            <SendModal isOpen={showSendModal} courseTitle={courseName} userName={sendBtnUsername} onClose={() => setShowSendModal(!showSendModal)} onConfirm={() => courseWorkflowStatusUpdate(sendBtnState)} />
        </section>
    )
}

const templateList = [
    {
        title: 'Text',
        tempSelection: [
            {
                title: 'Paragraph with heading',
                icon: Icons.text_temp_1,
                html: `
                <section>
                    <h2>Heading</h2>
                    <p>Imagine you're standing at the edge of a swimming pool. Some people dive right in without checking the water
                        depth, while others cautiously dip their toes first. This fundamental difference in approach mirrors how
                        individuals make investment decisions. The cautious toe-dipper might be a risk-averse retiree who can't
                        afford significant losses, while the confident diver could be a young professional with decades to recover
                        from market downturns.</p>
                </section>
                `
            },
            {
                title: 'Columns',
                icon: Icons.text_temp_2
            },
            {
                title: 'Table',
                icon: Icons.text_temp_2
            }
        ]
    },
    {
        title: 'Statement',
        tempSelection: [
            {
                title: 'Statement A',
                icon: Icons.statement_temp_1
            },
            {
                title: 'Statement B',
                icon: Icons.statement_temp_2
            },
            {
                title: 'Statement C',
                icon: Icons.statement_temp_3
            },
            {
                title: 'Statement D',
                icon: Icons.statement_temp_4
            },
            {
                title: 'Note',
                icon: Icons.statement_temp_5
            },
        ]
    },
    {
        title: 'Quote',
        tempSelection: [
            {
                title: 'Quote A',
                icon: Icons.quote_temp_1
            },
            {
                title: 'Quote B',
                icon: Icons.quote_temp_2
            },
            {
                title: 'Quote C',
                icon: Icons.quote_temp_3
            },
            {
                title: 'Quote D',
                icon: Icons.quote_temp_4
            },
            {
                title: 'Quote on image',
                icon: Icons.quote_temp_5
            },
            {
                title: 'Quote carousel',
                icon: Icons.quote_temp_6
            }
        ]
    },
    {
        title: 'List',
        tempSelection: [
            {
                title: 'Numbered list',
                icon: Icons.list_temp_1
            },
            {
                title: 'Checkbox list',
                icon: Icons.list_temp_2
            },
            {
                title: 'Bulleted list',
                icon: Icons.list_temp_3
            }
        ]
    },
    {
        title: 'Images',
        tempSelection: [
            {
                title: 'Image centered',
                icon: Icons.image_temp_1
            },
            {
                title: 'Image full width',
                icon: Icons.image_temp_2
            },
            {
                title: 'Image & text',
                icon: Icons.image_temp_3
            },
            {
                title: 'Image on text',
                icon: Icons.image_temp_4
            },
        ]
    },
    {
        title: 'Gallery',
        tempSelection: [
            {
                title: 'Carousel',
                icon: Icons.gallery_temp_1
            },
            {
                title: 'Two column grid',
                icon: Icons.gallery_temp_2
            },
            {
                title: 'Three column grid',
                icon: Icons.gallery_temp_3
            },
            {
                title: 'Four column grid',
                icon: Icons.gallery_temp_4
            },
        ]
    },
    {
        title: 'Interactive',
        tempSelection: [
            {
                title: 'Accordion',
                icon: Icons.interactive_temp_1
            },
            {
                title: 'Tabs',
                icon: Icons.interactive_temp_2
            },
            {
                title: 'Labeled graphic',
                icon: Icons.interactive_temp_3
            },
            {
                title: 'Process',
                icon: Icons.interactive_temp_4
            },
            {
                title: 'Scenario',
                icon: Icons.interactive_temp_5
            },
            {
                title: 'Flashcard stack',
                icon: Icons.interactive_temp_6
            },
            {
                title: 'Button',
                icon: Icons.interactive_temp_7
            },
        ]
    }
];

interface IRightToolbar {
    onOpenTab: (tab: string) => void;
}

const RightToolbar: React.FC<IRightToolbar> = ({ onOpenTab }) => {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const icons = [
        { icon: Icons.bug_icon, label: 'Bug' },
        { icon: Icons.comment_icon, label: 'Comments' },
        { icon: Icons.history_icons, label: 'Track Changes' },
        { icon: Icons.qc_icon, label: 'Quality Checks' },
        { icon: Icons.tracking_icon, label: 'Meta Tags' },
        { icon: Icons.checklist_icons, label: 'Style Checks' }
    ];

    return (
        <div className="flex gap-2 relative z-50">
            <div>
                <div className="flex flex-col items-center bg-white rounded-[10px] shadow-sm p-2 w-[47px]">
                    {icons.map((item, index) => (
                        <button
                            key={index}
                            className={`p-1.5 my-1 rounded-lg hover:bg-blue-50 transition-colors duration-200 group ${activeIndex === index ? 'bg-blue-200' : ''}`}
                            title={item.label}
                            onClick={() => {
                                onOpenTab(item.label);
                            }}
                        >
                            <img
                                src={item.icon}
                                alt={item.label}
                                className="w-5 h-5 group-hover:opacity-80 transition-opacity"
                            />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

interface ITopics {
    pageId: string;
    name: string;
    topicId: string;
    isComplete: boolean;
}

interface IModules {
    module_name: string;
    topics: ITopics[];
    id: string;
    moduleId?: string;
}

interface ITOCAccordion {
    item: { id: string; module_name: string; topic_names: ITopics[] }[];
    onChange: (topicId: string) => void;
}

const TOCAccordion: React.FC<ITOCAccordion> = ({ item, onChange }) => {
    // Changed from array to single string to track only one open item
    const [openItem, setOpenItem] = useState<string | null>(null);
    const [toc, setToc] = useState<IModules[]>([]);
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

    // Modified to only allow one open item at a time
    const toggleItem = (id: string) => {
        setOpenItem(prev => prev === id ? null : id);
    };

    const handleChangeTopic = (topicId: string) => {
        setSelectedTopic(topicId);
        onChange(topicId);
    };

    useEffect(() => {
        const formattedToc = item.map((o, index) => ({
            ...o,
            id: (index + 1).toString(),
            topics: o.topic_names || [],
        }));
        setToc(formattedToc);
    }, [item]);


    // Handle module drag end
    const handleModuleDragEnd = (event: any) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            setToc((prevToc) => {
                const oldIndex = prevToc.findIndex(i => i.id === active.id);
                const newIndex = prevToc.findIndex(i => i.id === over.id);
                return arrayMove(prevToc, oldIndex, newIndex);
            });
        }
    };

    // Handle topic drag end
    const handleTopicDragEnd = (event: any, moduleId: string) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            setToc((prevToc) => {
                const newToc = [...prevToc];
                const moduleIndex = newToc.findIndex(module => module.id === moduleId);

                if (moduleIndex !== -1) {
                    const topics = [...newToc[moduleIndex].topics];
                    const oldIndex = topics.findIndex(topic => topic.topicId === active.id);
                    const newIndex = topics.findIndex(topic => topic.topicId === over.id);

                    if (oldIndex !== -1 && newIndex !== -1) {
                        newToc[moduleIndex].topics = arrayMove(topics, oldIndex, newIndex);
                    }
                }

                return newToc;
            });
        }
    };

    // Sortable Module component
    const SortableModule = ({ item }: { item: IModules }) => {
        const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });

        const style = {
            transform: CSS.Transform.toString(transform),
            transition,
        };

        // Changed to use single openItem state
        const isOpen = openItem === item.id;

        return (
            <div
                ref={setNodeRef}
                style={style}
                className={`accordion-item relative mb-4 rounded-lg border 
                ${isOpen
                        ? 'bg-[#F2F4FF] border-[#4318FF] ]'
                        : 'bg-[#FFFFFF] shadow-[0px_4px_8px_0px_#959DA533]'}`}
            >
                {/* Header Section */}
                <h2 id={`accordion-heading-${item.id}`} className="w-full border-b py-2.5">
                    <button
                        type="button"
                        className="w-full flex flex-col items-center text-[#374373] text-left group"
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleItem(item.id);
                        }}
                        aria-expanded={isOpen}
                        aria-controls={`accordion-body-${item.id}`}
                    >
                        <div className="flex items-center px-2 justify-between w-full">
                            <span className="border rounded-full px-3 py-1 bg-white text-[#4318FF] font-medium text-sm flex items-center justify-center">
                                {item.id}
                            </span>

                            <img
                                className={`shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-0' : 'rotate-180'}`}
                                src={Icons.toc_arrow}
                                alt="accordion_arrow"
                            />
                        </div>

                        <div className="flex items-center px-4 gap-2.5 w-full mt-2">
                            {isOpen ? (
                                <>
                                    <span
                                        {...attributes}
                                        {...listeners}
                                        className="text-[#40444D] cursor-grab active:cursor-grabbing opacity-100 mr-2"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        ⠿
                                    </span>

                                    <span className="font-bold text-left text-black">{item.module_name}</span>
                                </>
                            ) : (
                                <span className="font-normal text-left text-black w-full">{item.module_name}</span>
                            )}
                        </div>
                    </button>
                </h2>

                <div
                    id={`accordion-body-${item.id}`}
                    className={`transition-[max-height] duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[500px]' : 'max-h-0'}`}
                    aria-labelledby={`accordion-heading-${item.id}`}
                >
                    <div className="border border-b-0 border-gray-200 px-4 py-2">
                        <TopicsList moduleId={item.id} topics={item.topics} moduleIdForHandler={item.moduleId} />
                    </div>
                </div>
            </div>
        );
    };

    // Topics List component with its own DnD context
    const TopicsList = ({ moduleId, topics, moduleIdForHandler }: { moduleId: string, topics: ITopics[], moduleIdForHandler?: string }) => {
        return (
            <DndContext collisionDetection={closestCenter} onDragEnd={(event) => handleTopicDragEnd(event, moduleId)}>
                <SortableContext items={topics.map(topic => topic.topicId)}>
                    <ul className="list-none list-inside">
                        {topics.map((topic, index) => (
                            <SortableTopic
                                key={topic.topicId}
                                topic={topic}
                                moduleId={moduleIdForHandler || moduleId}
                            />
                        ))}
                    </ul>
                </SortableContext>
            </DndContext>
        );
    };

    const SortableTopic = ({ topic, moduleId }: { topic: ITopics, moduleId: string }) => {
        const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: topic.topicId });

        const style = {
            transform: CSS.Transform.toString(transform),
            transition,
        };

        return (
            <li ref={setNodeRef} style={style} className="flex items-center gap-2 py-1.5">
                {/* Drag Handle for Topics */}
                <div
                    {...attributes}
                    {...listeners}
                    className={`cursor-grab active:cursor-grabbing transition-all 
                    ${selectedTopic === topic.topicId ? 'text-[#4318FF]' : 'text-[#40444D]'}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    ⠿
                </div>

                {/* Topic Button */}
                <button
                    className={`w-full text-sm text-left px-2 py-1 rounded-lg transition-all 
                    ${selectedTopic === topic.topicId
                            ? 'text-[#4318FF] font-medium'  // Selected: Blue text
                            : 'text-gray-900 hover:bg-gray-300'  // Unselected: Dark text + hover effect
                        }`}
                    onClick={() => handleChangeTopic(topic.topicId)}
                >
                    <span
                        className="truncate block text-ellipsis overflow-hidden whitespace-nowrap"
                        title={topic.name} // Tooltip to show full text on hover
                    >
                        {topic.name}
                    </span>

                </button>
            </li>
        );
    };

    return (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleModuleDragEnd}>
            <div className="overflow-y-auto h-[419px] overflow-x-hidden scrollbar-light-gray pe-1 mt-4">
                <div className="w-full" data-accordion="collapse">
                    <SortableContext items={toc.map(i => i.id)}>
                        {toc.map((item) => (
                            <SortableModule key={item.id} item={item} />
                        ))}
                    </SortableContext>
                </div>
            </div>
        </DndContext>
    );
};


const TOCAccordionModal: React.FC<ITOCAccordion> = ({ item, onChange }) => {
    // Changed from array to single string to track only one open item
    const [openItem, setOpenItem] = useState<string | null>(null);
    const [toc, setToc] = useState<IModules[]>([]);
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

    // Modified to only allow one open item at a time
    const toggleItem = (id: string) => {
        setOpenItem(prev => prev === id ? null : id);
    };

    const handleChangeTopic = (pageId: string) => {
        setSelectedTopic(pageId);
        //onChange(pageId);
    };

    useEffect(() => {
        const formattedToc = item.map((o, index) => ({
            ...o,
            id: (index + 1).toString(),
            topics: o.topic_names || [],
        }));
        setToc(formattedToc);
    }, [item]);

    return (
        <div className="overflow-y-auto h-[70%] overflow-x-hidden scrollbar">
            <div className="w-full pe-[7px]" data-accordion="collapse">
                {toc.map((item) => (
                    <div
                        key={item.id}
                        className={`accordion-item mb-4 mx-2 border border-gray-300 rounded-[16px] 
                        ${openItem === item.id ? 'shadow-xl' : 'shadow-sm'}`}
                    >
                        {/* Accordion Header */}
                        <h2 id={`accordion-heading-${item.id}`} className="w-full bg-white rounded-t-[16px]">
                            <button
                                type="button"
                                className="flex items-center gap-2 w-full py-4 px-5 text-base font-bold text-left text-[#374373] 
                                bg-white shadow-md transition-all duration-300 hover:bg-gray-100 rounded-[16px]"
                                onClick={() => toggleItem(item.id)}
                                aria-expanded={openItem === item.id}
                                aria-controls={`accordion-body-${item.id}`}
                            >
                                <span className="flex-1">{item.module_name}</span>
                                <img
                                    className={`shrink-0 transition-transform duration-300 
                                    ${openItem === item.id ? 'rotate-0' : 'rotate-180'}`}
                                    src={Icons.toc_arrow}
                                    alt="accordion_arrow.svg"
                                />
                            </button>
                        </h2>

                        {/* Accordion Body */}
                        <div
                            id={`accordion-body-${item.id}`}
                            className={`transition-[max-height] duration-300 ease-in-out overflow-hidden 
                            ${openItem === item.id ? 'max-h-[500px]' : 'max-h-0'}`}
                            aria-labelledby={`accordion-heading-${item.id}`}
                        >
                            <div className="border border-gray-200 bg-white rounded-b-[16px]">
                                <ul className="list-none list-inside">
                                    {item.topics.map((topic, index) => (
                                        <li
                                            key={index}
                                            className={`text-sm font-normal px-5 py-3 cursor-pointer transition-all duration-200 
                                            ${selectedTopic === topic.pageId ? 'text-[#4318FF] font-semibold' : 'text-gray-600'}
                                            hover:bg-gray-50`}
                                        >
                                            {topic.name}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

interface IDotDropdownMenu {
    onSelectedMenu: (menu: string) => void;
    hasPremission: any;
    sendNext: any;
    sendBack: any;
    onSendDisabled: boolean;
}

const DotDropdownMenu: React.FC<IDotDropdownMenu> = ({ onSelectedMenu, hasPremission, sendNext, sendBack, onSendDisabled }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    const disableBtnWhileScreaming = useSelector((state: RootState) => state.navbar.disableBtnWhileScreaming);


    const toggleDropdown = (): void => {
        setIsOpen((prev) => !prev);
    };

    const [modalOpen, setModalOpen] = useState(false);
    const navigate = useNavigate();
    const courseName = useSelector((state: RootState) => state.courseCreation.courseName);

    const handleConfirm = () => {
        setModalOpen(false);
        navigate('/course-creation/Assembly/Step-5');
    };


    useEffect(() => {
        const handleClickOutside = (event: MouseEvent): void => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="dropdown-container relative" ref={dropdownRef}>
            <button
                id="dropdownMenuIconButton-1"
                data-dropdown-toggle="dropdownDotsModule"
                className="dropdown-trigger inline-flex items-center px-4 py-2.5 shadow-[0px_0px_4px_0px_rgba(0,0,0,0.12)] text-sm font-medium text-center text-gray-900 border bg-white rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-50"
                type="button"
                onClick={toggleDropdown}
            //disabled={disableBtnWhileScreaming}
            >
                <svg width="4" height="16" viewBox="0 0 4 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 16C1.45 16 0.979167 15.8042 0.5875 15.4125C0.195833 15.0208 0 14.55 0 14C0 13.45 0.195833 12.9792 0.5875 12.5875C0.979167 12.1958 1.45 12 2 12C2.55 12 3.02083 12.1958 3.4125 12.5875C3.80417 12.9792 4 13.45 4 14C4 14.55 3.80417 15.0208 3.4125 15.4125C3.02083 15.8042 2.55 16 2 16ZM2 10C1.45 10 0.979167 9.80417 0.5875 9.4125C0.195833 9.02083 0 8.55 0 8C0 7.45 0.195833 6.97917 0.5875 6.5875C0.979167 6.19583 1.45 6 2 6C2.55 6 3.02083 6.19583 3.4125 6.5875C3.80417 6.97917 4 7.45 4 8C4 8.55 3.80417 9.02083 3.4125 9.4125C3.02083 9.80417 2.55 10 2 10ZM2 4C1.45 4 0.979167 3.80417 0.5875 3.4125C0.195833 3.02083 0 2.55 0 2C0 1.45 0.195833 0.979167 0.5875 0.5875C0.979167 0.195833 1.45 0 2 0C2.55 0 3.02083 0.195833 3.4125 0.5875C3.80417 0.979167 4 1.45 4 2C4 2.55 3.80417 3.02083 3.4125 3.4125C3.02083 3.80417 2.55 4 2 4Z" fill="#4318FF" />
                </svg>

            </button>

            <div
                id="dropdownDots-1"
                className={`dropdown-menu absolute right-0 top-8 z-50 bg-white divide-y divide-gray-100 rounded-xl shadow-[0px_48px_100px_0px_#110C2E26] w-48 border-b border-[#E0E5F2] transform translate-x-0 translate-y-2 ${isOpen ? 'block' : 'hidden'}`}
            >
                <ul className="p-2 text-sm font-normal">
                    <li>
                        <a className="block p-2 hover:bg-gray-100 cursor-pointer" onClick={() => {
                            setIsOpen(false);
                            onSelectedMenu('preview');
                        }}>Preview</a>
                    </li>
                    {hasPremission.PublishExportCourse && <li>
                        <a className="block p-2 hover:bg-gray-100 cursor-pointer" onClick={() => {
                            setIsOpen(false);
                            onSelectedMenu('publish');
                        }}>Publish</a>
                    </li>}
                    {sendNext.btnVisible && <li>
                        <a className={`block p-2 hover:bg-gray-100 cursor-pointer ${!onSendDisabled ? 'text-gray-400' : ''}`} onClick={() => {
                            setIsOpen(false);
                            if (onSendDisabled) onSelectedMenu('send');
                        }}>Send {sendNext.workflowName}</a>
                    </li>}
                    {sendBack.btnVisible && <li>
                        <a className={`block p-2 hover:bg-gray-100 cursor-pointer ${!onSendDisabled ? 'text-gray-400' : ''}`} onClick={() => {
                            setIsOpen(false);
                            if (onSendDisabled) onSelectedMenu('send_back');
                        }}>Send back {sendBack.workflowName}</a>
                    </li>}
                    {hasPremission.deleteCoursecontent && <li>
                        <a className={`block p-2 hover:bg-gray-100 cursor-pointer ${onSendDisabled ? 'text-gray-400' : ''}`}>Delete</a>
                    </li>}
                </ul>


            </div>
            <ReviewModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={handleConfirm}
                reviewerName="Alec Hughes"
                unitTitle={courseName}
            />
        </div>
    );
};

const DropdownMenu: React.FC = () => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    const toggleDropdown = (): void => {
        setIsOpen((prev) => !prev);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent): void => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="dropdown-container relative ml-auto" ref={dropdownRef}>
            {/* <button
                id="dropdownMenuIconButton-1"
                data-dropdown-toggle="dropdownDotsModule"
                className="dropdown-trigger inline-flex items-center px-4 py-2.5 shadow-[0px_0px_4px_0px_rgba(0,0,0,0.12)] text-sm font-medium text-center text-gray-900 border bg-white rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-50"
                type="button"
                onClick={toggleDropdown}
            >
                Editing

            </button>
 */}
            {/* <button
                id="dropdownMenuIconButton-1"
                data-dropdown-toggle="dropdownDotsModule"
                type="button"
                //onClick={handleGenerateAI}
                className="text-[#4318FF] bg-white flex items-center justify-between gap-2 font-bold border border-[#4318FF] focus:outline-none hover:bg-gray-200 focus:ring-1 focus:ring-[#4318FF] rounded-full text-base px-5 py-2 me-4"
                onClick={toggleDropdown}
            >
                <img className="inline-block align-top" src={Icons.pen} alt="pen.svg" />
                Editing
                <img className="inline-block align-top" src={Icons.dropdown_arrow} alt="pen.svg" />
            </button> */}

            <div
                id="dropdownDots-1"
                className={`dropdown-menu absolute right-0 top-9 z-50 bg-white divide-y divide-gray-100 rounded-xl shadow-[0px_48px_100px_0px_#110C2E26] w-48 border-b border-[#E0E5F2] transform translate-x-0 translate-y-2 ${isOpen ? 'block' : 'hidden'}`}
            >
                <ul className="p-2 text-sm font-normal">
                    <li>
                        <a className="block p-2 hover:bg-gray-100 cursor-pointer">
                            <svg className="inline me-2" width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2.91667 11.0833H3.74792L9.45 5.38125L8.61875 4.55L2.91667 10.2521V11.0833ZM2.33333 12.25C2.16806 12.25 2.02951 12.1941 1.91771 12.0823C1.8059 11.9705 1.75 11.8319 1.75 11.6667V10.2521C1.75 10.0965 1.77917 9.94826 1.8375 9.80729C1.89583 9.66632 1.97847 9.54236 2.08542 9.43542L9.45 2.08542C9.56667 1.97847 9.69549 1.89583 9.83646 1.8375C9.97743 1.77917 10.1257 1.75 10.2812 1.75C10.4368 1.75 10.5875 1.77917 10.7333 1.8375C10.8792 1.89583 11.0056 1.98333 11.1125 2.1L11.9146 2.91667C12.0312 3.02361 12.1163 3.15 12.1698 3.29583C12.2233 3.44167 12.25 3.5875 12.25 3.73333C12.25 3.88889 12.2233 4.03715 12.1698 4.17812C12.1163 4.3191 12.0312 4.44792 11.9146 4.56458L4.56458 11.9146C4.45764 12.0215 4.33368 12.1042 4.19271 12.1625C4.05174 12.2208 3.90347 12.25 3.74792 12.25H2.33333ZM9.02708 4.97292L8.61875 4.55L9.45 5.38125L9.02708 4.97292Z" fill="#4318FF" />
                            </svg>
                            Editing
                        </a>
                    </li>
                    <li>
                        <a className="block p-2 hover:bg-gray-100 cursor-pointer">
                            <svg className="inline me-2" width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6.99844 9.33398C7.7276 9.33398 8.3474 9.07878 8.85781 8.56836C9.36823 8.05794 9.62344 7.43815 9.62344 6.70898C9.62344 5.97982 9.36823 5.36003 8.85781 4.84961C8.3474 4.33919 7.7276 4.08398 6.99844 4.08398C6.26927 4.08398 5.64948 4.33919 5.13906 4.84961C4.62865 5.36003 4.37344 5.97982 4.37344 6.70898C4.37344 7.43815 4.62865 8.05794 5.13906 8.56836C5.64948 9.07878 6.26927 9.33398 6.99844 9.33398ZM6.99844 8.28398C6.56094 8.28398 6.18906 8.13086 5.88281 7.82461C5.57656 7.51836 5.42344 7.14648 5.42344 6.70898C5.42344 6.27148 5.57656 5.89961 5.88281 5.59336C6.18906 5.28711 6.56094 5.13398 6.99844 5.13398C7.43594 5.13398 7.80781 5.28711 8.11406 5.59336C8.42031 5.89961 8.57344 6.27148 8.57344 6.70898C8.57344 7.14648 8.42031 7.51836 8.11406 7.82461C7.80781 8.13086 7.43594 8.28398 6.99844 8.28398ZM6.99844 11.084C5.69566 11.084 4.50712 10.734 3.43281 10.034C2.35851 9.33398 1.51024 8.41037 0.888021 7.26315C0.83941 7.17565 0.802951 7.08572 0.778646 6.99336C0.75434 6.901 0.742188 6.80621 0.742188 6.70898C0.742188 6.61176 0.75434 6.51697 0.778646 6.42461C0.802951 6.33225 0.83941 6.24232 0.888021 6.15482C1.51024 5.0076 2.35851 4.08398 3.43281 3.38398C4.50712 2.68398 5.69566 2.33398 6.99844 2.33398C8.30122 2.33398 9.48976 2.68398 10.5641 3.38398C11.6384 4.08398 12.4866 5.0076 13.1089 6.15482C13.1575 6.24232 13.1939 6.33225 13.2182 6.42461C13.2425 6.51697 13.2547 6.61176 13.2547 6.70898C13.2547 6.80621 13.2425 6.901 13.2182 6.99336C13.1939 7.08572 13.1575 7.17565 13.1089 7.26315C12.4866 8.41037 11.6384 9.33398 10.5641 10.034C9.48976 10.734 8.30122 11.084 6.99844 11.084ZM6.99844 9.91732C8.09705 9.91732 9.10573 9.62808 10.0245 9.04961C10.9432 8.47114 11.6457 7.69093 12.1318 6.70898C11.6457 5.72704 10.9432 4.94683 10.0245 4.36836C9.10573 3.78989 8.09705 3.50065 6.99844 3.50065C5.89983 3.50065 4.89115 3.78989 3.9724 4.36836C3.05365 4.94683 2.35122 5.72704 1.8651 6.70898C2.35122 7.69093 3.05365 8.47114 3.9724 9.04961C4.89115 9.62808 5.89983 9.91732 6.99844 9.91732Z" fill="#2B3674" />
                            </svg>
                            Viewing
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    );
};

interface IOption {
    id: string;
    label: string;
    isPrimary?: boolean;
}

const RadioButtonGroup: React.FC = () => {
    const [selectedOption, setSelectedOption] = useState<string>('dei');

    const options: IOption[] = [
        { id: 'dei', label: 'DEI', isPrimary: true },
        { id: 'copyEditing', label: 'Copy editing' },
        { id: 'frequentlyUsed', label: 'Frequently used' },
        { id: 'itemConstruction', label: 'Item construction' },
        { id: 'taggingMetadata', label: 'Tagging/metadata' },
        { id: 'itemAccuracy', label: 'Item accuracy' },
        { id: 'others', label: 'Others' }
    ];

    const handleSelection = (id: string): void => {
        setSelectedOption(selectedOption === id ? '' : id);
    };

    return (
        <div className="flex flex-wrap gap-2 mt-2">
            {options.map((option) => {
                const isSelected = selectedOption === option.id;

                return (
                    <button
                        key={option.id}
                        onClick={() => handleSelection(option.id)}
                        className={`px-4 py-2 rounded-full text-sm focus:outline-none border border-[#C7CBE0] ${isSelected ? 'bg-[#4318FF] text-white' : ''}`}
                        type="button"
                    >
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
};

interface IBugsModal {
    isOpen: boolean;
    onClose: () => void;
    //bugType: string | null;
    onSubmit: (comment: string, bugType: string) => void;
}

const BugsModal: React.FC<IBugsModal> = ({
    isOpen,
    onClose,
    //bugType,
    onSubmit
}) => {

    const [comment, setComment] = useState<string>('');
    const [bugType, setBugType] = useState<string>('');

    const handleSubmit = () => {
        onSubmit(comment, bugType);
        setComment('');
        onClose();
    };


    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex justify-center items-center overflow-y-auto bg-[#000000] bg-opacity-50"
            onClick={onClose}
        >
            <div className="relative w-full max-w-2xl p-4 max-h-full">
                <div
                    className="relative bg-white shadow-sm rounded-2xl"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between p-4 rounded-t-2xl bg-[#F2F4FF]">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Add a bug
                        </h3>
                        <button
                            type="button"
                            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
                            onClick={onClose}
                        >
                            <svg
                                className="w-3 h-3"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 14 14"
                            >
                                <path
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                                />
                            </svg>
                            <span className="sr-only">Close modal</span>
                        </button>
                    </div>

                    <div>
                        <div className="p-4 space-y-4">
                            <div className="flex items-end gap-2">
                                <div className="w-full">
                                    <BugCategory onSelected={(bugType: string) => setBugType(bugType)} />
                                </div>
                                {/* <span className="mb-2 text-sm font-semibold">OR</span>
                                <div className="w-full">
                                    <label htmlFor="first_name" className="block mb-2 text-sm font-semibold text-gray-900">Add new</label>
                                    <input type="text" id="first_name" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" placeholder="Enter bug name" />
                                </div> */}
                            </div>
                            <textarea
                                id="message"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows={4}
                                className="block resize-none p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter description of the bug"
                            ></textarea>
                        </div>
                    </div>

                    <div className="flex items-center p-4 border-t border-gray-200 rounded-b">
                        <button
                            onClick={handleSubmit}
                            type="button"
                            className={`font-bold ${comment.length === 0 ? 'bg-gray-300 text-[grey]' : 'bg-[linear-gradient(135deg,_#868CFF_0%,_#4318FF_100%)] hover:bg-[linear-gradient(135deg,_#6A7FFF_0%,_#2A1CFF_100%)] text-white'}   focus:ring-1 focus:outline-none focus:ring-blue-300 rounded-full text-sm px-4 py-2.5 text-center`}
                            disabled={comment.length === 0}
                        >
                            Submit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface ICommentModal {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (comment: string) => void;
}

const CommentModal: React.FC<ICommentModal> = ({
    isOpen,
    onClose,
    onSubmit
}) => {

    const [comment, setComment] = useState<string>('');

    const handleSubmit = () => {
        onSubmit(comment);
        setComment('');
        onClose();
    };


    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex justify-center items-center overflow-y-auto bg-[#000000] bg-opacity-50"
            onClick={onClose}
        >
            <div className="relative w-full max-w-2xl p-4 max-h-full">
                <div
                    className="relative bg-white shadow-sm rounded-2xl"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between p-4 rounded-t-2xl bg-[#F2F4FF]">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Add Comment
                        </h3>
                        <button
                            type="button"
                            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
                            onClick={onClose}
                        >
                            <svg
                                className="w-3 h-3"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 14 14"
                            >
                                <path
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                                />
                            </svg>
                            <span className="sr-only">Close modal</span>
                        </button>
                    </div>

                    <div className="p-4 md:p-5 space-y-4">
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={4}
                            className="block resize-none p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter description of the comment"
                        ></textarea>
                    </div>

                    <div className="flex items-center p-4 md:p-5 border-t border-gray-200 rounded-b">
                        <button
                            onClick={handleSubmit}
                            type="button"
                            className={`font-bold ${comment.length === 0 ? 'bg-gray-300 text-[grey]' : 'bg-[linear-gradient(135deg,_#868CFF_0%,_#4318FF_100%)] hover:bg-[linear-gradient(135deg,_#6A7FFF_0%,_#2A1CFF_100%)] text-white'}   focus:ring-1 focus:outline-none focus:ring-blue-300 rounded-full text-sm px-4 py-2.5 text-center`}
                            disabled={comment.length === 0}
                        >
                            Submit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface IBugCategory {
    onSelected: (bugType: string) => void;
}
const BugCategory: React.FC<IBugCategory> = ({ onSelected }) => {
    const [selectedBugType, setSelecteddBugType] = useState<string>('');

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelecteddBugType(event.target.value);

    };

    const bugsTypes = [
        'Punctuations errors',
        'Capitalization errors',
        'Contraction used',
        'Unclear or misplaced modifier',
        'Punctuations errors'
    ];

    useEffect(() => {
        onSelected(selectedBugType);
    }, [selectedBugType]);

    return (
        <form>
            <label
                htmlFor="countries"
                className="block mb-2 text-sm font-semibold text-gray-900"
            >
                Select bug category
            </label>
            <select
                id="countries"
                value={selectedBugType}
                onChange={handleChange}
                className="text-[#8D95A4] bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            >
                <option value="">Select</option>
                {bugsTypes.map((type, index) => <option key={index} value={type}>{type}</option>)}
            </select>
        </form>
    );
};

interface IRegenContentAIModal {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (comment: string) => void;
    inputHtmlContent: string;
}

const RegenContentAIModal: React.FC<IRegenContentAIModal> = ({
    isOpen,
    onClose,
    onSubmit,
    inputHtmlContent
}) => {

    const iframeRef = useRef<HTMLIFrameElement>(null);

    const [message, setMessage] = useState<string>('');
    const SuggestionsList = [
        "Improve clarity & readability",
        "Elaborate details",
        "Simplify language",
        "Adjust learning outcomes",
        "Modify knowledge requirements"
    ];

    const handleGenerateAI = () => {
        onSubmit(message);
        setMessage('');
        onClose();
    };


    const handleMessageChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(event.target.value);
    };

    useEffect(() => {
        const iframe = iframeRef.current;
        if (iframe && iframe.contentWindow) {
            const doc = iframe.contentWindow.document;
            const style = document.createElement('style');
            style.innerHTML = `
                body {
                    --sb-track-color: white;
                    --sb-thumb-color: #C7CBE0;
                    --sb-size: 3px;
                    --sb-big-size: 5px;
                }

                body::-webkit-scrollbar {
                    width: var(--sb-big-size);
                }

                body::-webkit-scrollbar-track {
                    background: var(--sb-track-color);
                    border-radius: 12px;
                }

                body::-webkit-scrollbar-thumb {
                    background: var(--sb-thumb-color);
                    border-radius: 12px;
                    cursor: pointer;
                }
          `;
            doc.head.appendChild(style);
        }
    }, []);


    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex justify-center items-center overflow-y-auto bg-[#000000] bg-opacity-50"
            onClick={onClose}
        >
            <div className="relative w-full max-w-2xl p-4 max-h-full">
                <div
                    className="relative bg-white shadow-sm rounded-2xl"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between p-4 rounded-t-2xl bg-[#F2F4FF]">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Refine and regenerate your content with AI
                        </h3>
                        <button
                            type="button"
                            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
                            onClick={onClose}
                        >
                            <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M16.6932 8.96077L13.5881 12L16.6932 15.0392C16.7807 15.125 16.8502 15.2268 16.8976 15.3389C16.945 15.4509 16.9694 15.571 16.9694 15.6923C16.9694 15.8136 16.945 15.9337 16.8976 16.0457C16.8502 16.1578 16.7807 16.2596 16.6932 16.3454C16.6056 16.4311 16.5016 16.4992 16.3872 16.5456C16.2727 16.592 16.1501 16.6159 16.0262 16.6159C15.9023 16.6159 15.7797 16.592 15.6652 16.5456C15.5508 16.4992 15.4468 16.4311 15.3592 16.3454L12.2553 13.305L9.15143 16.3454C9.06384 16.4311 8.95986 16.4992 8.84542 16.5456C8.73098 16.592 8.60832 16.6159 8.48446 16.6159C8.36059 16.6159 8.23793 16.592 8.12349 16.5456C8.00905 16.4992 7.90507 16.4311 7.81748 16.3454C7.72989 16.2596 7.66042 16.1578 7.61301 16.0457C7.56561 15.9337 7.54121 15.8136 7.54121 15.6923C7.54121 15.571 7.56561 15.4509 7.61301 15.3389C7.66042 15.2268 7.72989 15.125 7.81748 15.0392L10.9226 12L7.81748 8.96077C7.64059 8.78756 7.54121 8.55264 7.54121 8.30769C7.54121 8.06274 7.64059 7.82782 7.81748 7.65461C7.99437 7.48141 8.23429 7.3841 8.48446 7.3841C8.73462 7.3841 8.97454 7.48141 9.15143 7.65461L12.2553 10.695L15.3592 7.65461C15.4468 7.56885 15.5508 7.50082 15.6652 7.4544C15.7797 7.40799 15.9023 7.3841 16.0262 7.3841C16.1501 7.3841 16.2727 7.40799 16.3872 7.4544C16.5016 7.50082 16.6056 7.56885 16.6932 7.65461C16.7807 7.74038 16.8502 7.84219 16.8976 7.95425C16.945 8.0663 16.9694 8.1864 16.9694 8.30769C16.9694 8.42898 16.945 8.54908 16.8976 8.66113C16.8502 8.77319 16.7807 8.875 16.6932 8.96077ZM24.5106 12C24.5106 14.3734 23.7919 16.6934 22.4452 18.6668C21.0986 20.6402 19.1846 22.1783 16.9452 23.0865C14.7059 23.9948 12.2417 24.2324 9.86443 23.7694C7.48713 23.3064 5.30344 22.1635 3.5895 20.4853C1.87557 18.807 0.708362 16.6689 0.235488 14.3411C-0.237386 12.0133 0.00531004 9.60051 0.932886 7.4078C1.86046 5.21508 3.43126 3.34094 5.44663 2.02236C7.46201 0.703788 9.83145 0 12.2553 0C15.5046 0.00335979 18.6198 1.26872 20.9173 3.51843C23.2149 5.76814 24.5072 8.81843 24.5106 12ZM22.6252 12C22.6252 9.99176 22.017 8.02861 20.8776 6.35882C19.7381 4.68903 18.1186 3.38759 16.2237 2.61907C14.3289 1.85055 12.2438 1.64947 10.2323 2.04126C8.2207 2.43305 6.37296 3.40011 4.92271 4.82015C3.47245 6.24019 2.48482 8.04943 2.08469 10.0191C1.68457 11.9887 1.88993 14.0303 2.6748 15.8857C3.45967 17.7411 4.78881 19.3269 6.49412 20.4426C8.19944 21.5583 10.2044 22.1538 12.2553 22.1538C15.0046 22.1508 17.6404 21.08 19.5845 19.1765C21.5285 17.2729 22.6221 14.692 22.6252 12Z" fill="#4318FF" />
                            </svg>

                            <span className="sr-only">Close modal</span>
                        </button>
                    </div>

                    <div className="p-4 md:p-5 space-y-4">
                        {/* <div className="rounded-[16px] bg-[#F2F4FF] p-3 overflow-auto h-[90px] scrollbar" style={{ zoom: '80%' }} dangerouslySetInnerHTML={{ __html: inputHtmlContent }}></div> */}
                        <div className="rounded-[16px] bg-[#F2F4FF] p-3 scrollbar">
                            <iframe ref={iframeRef} className="h-[80px] w-full" srcDoc={inputHtmlContent}></iframe>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-[16px] shadow-[rgba(17,_17,_26,_0.1)_0px_0px_16px] p-4 mb-2">
                            <label
                                htmlFor="message"
                                className="block mb-2 text-sm font-medium text-gray-900"
                            >
                                How would you like to generate ? <span className="text-[#F6292D] text-sm">*</span>
                            </label>
                            <textarea
                                id="message"
                                rows={3}
                                value={message}
                                onChange={handleMessageChange}
                                className="block p-4 w-full text-sm bg-gray-50 rounded-lg border border-[#E0E5F2] focus:ring-blue-500 focus:border-blue-500 resize-none placeholder:text-[#8D95A4]"
                                placeholder="Describe the changes you want, such as improving clarity, adding details, simplifying language, or adjusting learning objectives."
                            />
                            <button
                                type="button"
                                onClick={handleGenerateAI}
                                className="text-white bg-[linear-gradient(135deg,_#868CFF_0%,_#4318FF_100%)] hover:bg-[linear-gradient(135deg,_#6A7FFF_0%,_#2A1CFF_100%)] focus:ring-1 focus:outline-none focus:ring-blue-300 font-normal rounded-full text-sm px-5 py-2 text-center mt-4"
                            >
                                <img className="inline-block me-2 w-[18.33px] align-top" src={Icons.gen_ai_icon} alt="gen_ai_icon.svg" />
                                Generate
                            </button>
                        </div>
                        {/* <div className="mt-2">
                            <h2 className="text-base font-bold">Suggestions</h2>
                            <ul className="max-w-md space-y-6 list-inside my-4 ms-2.5">
                                {SuggestionsList.map((list, index) => (
                                    <li key={index} className="flex items-center text-[#4318FF] text-sm font-semibold gap-4">
                                        <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M10.679 1.59375L11.8004 6.36238C12.1727 7.94539 13.4088 9.18163 14.9918 9.55377L19.7604 10.6753L14.9918 11.7967C13.4088 12.169 12.1725 13.4051 11.8004 14.9881L10.679 19.7567L9.55768 14.9881C9.18534 13.4051 7.94929 12.1688 6.36628 11.7967L1.59766 10.6753L6.36628 9.55377C7.94929 9.18143 9.18554 7.94539 9.55768 6.36238L10.679 1.59375Z" fill="#4318FF" />
                                            <path d="M10.6787 0.353516L10.8946 6.11601C10.9831 8.47794 12.8774 10.3722 15.2394 10.4607L21.0018 10.6767L15.2394 10.8927C12.8774 10.9812 10.9831 12.8755 10.8946 15.2374L10.6787 20.9999L10.4627 15.2374C10.3742 12.8755 8.4799 10.9812 6.11796 10.8927L0.355469 10.6767L6.11796 10.4607C8.4799 10.3722 10.3742 8.47794 10.4627 6.11601L10.6787 0.353516Z" fill="#8266FF" />
                                        </svg>
                                        {list}
                                    </li>
                                ))}
                            </ul>
                        </div> */}
                    </div>
                </div>
            </div>
        </div>
    );
};

interface IRegenContentAIFullModal {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (comment: string) => void;
}

const RegenContentAIFullModal: React.FC<IRegenContentAIFullModal> = ({
    isOpen,
    onClose,
    onSubmit,
}) => {

    const [message, setMessage] = useState<string>('');
    const SuggestionsList = [
        "Improve clarity & readability",
        "Elaborate details",
        "Simplify language",
        "Adjust learning outcomes",
        "Modify knowledge requirements"
    ];

    const handleGenerateAI = () => {
        onSubmit(message);
        setMessage('');
        onClose();
    };


    const handleMessageChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(event.target.value);
    };


    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex justify-center items-center overflow-y-auto bg-[#000000] bg-opacity-50"
            onClick={onClose}
        >
            <div className="relative w-full max-w-2xl p-4 max-h-full">
                <div
                    className="relative bg-white shadow-sm rounded-2xl"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between p-4 rounded-t-2xl bg-[#F2F4FF]">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Polish and regenerate your content with AI! 🚀
                        </h3>
                        <button
                            type="button"
                            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
                            onClick={onClose}
                        >
                            <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M16.6932 8.96077L13.5881 12L16.6932 15.0392C16.7807 15.125 16.8502 15.2268 16.8976 15.3389C16.945 15.4509 16.9694 15.571 16.9694 15.6923C16.9694 15.8136 16.945 15.9337 16.8976 16.0457C16.8502 16.1578 16.7807 16.2596 16.6932 16.3454C16.6056 16.4311 16.5016 16.4992 16.3872 16.5456C16.2727 16.592 16.1501 16.6159 16.0262 16.6159C15.9023 16.6159 15.7797 16.592 15.6652 16.5456C15.5508 16.4992 15.4468 16.4311 15.3592 16.3454L12.2553 13.305L9.15143 16.3454C9.06384 16.4311 8.95986 16.4992 8.84542 16.5456C8.73098 16.592 8.60832 16.6159 8.48446 16.6159C8.36059 16.6159 8.23793 16.592 8.12349 16.5456C8.00905 16.4992 7.90507 16.4311 7.81748 16.3454C7.72989 16.2596 7.66042 16.1578 7.61301 16.0457C7.56561 15.9337 7.54121 15.8136 7.54121 15.6923C7.54121 15.571 7.56561 15.4509 7.61301 15.3389C7.66042 15.2268 7.72989 15.125 7.81748 15.0392L10.9226 12L7.81748 8.96077C7.64059 8.78756 7.54121 8.55264 7.54121 8.30769C7.54121 8.06274 7.64059 7.82782 7.81748 7.65461C7.99437 7.48141 8.23429 7.3841 8.48446 7.3841C8.73462 7.3841 8.97454 7.48141 9.15143 7.65461L12.2553 10.695L15.3592 7.65461C15.4468 7.56885 15.5508 7.50082 15.6652 7.4544C15.7797 7.40799 15.9023 7.3841 16.0262 7.3841C16.1501 7.3841 16.2727 7.40799 16.3872 7.4544C16.5016 7.50082 16.6056 7.56885 16.6932 7.65461C16.7807 7.74038 16.8502 7.84219 16.8976 7.95425C16.945 8.0663 16.9694 8.1864 16.9694 8.30769C16.9694 8.42898 16.945 8.54908 16.8976 8.66113C16.8502 8.77319 16.7807 8.875 16.6932 8.96077ZM24.5106 12C24.5106 14.3734 23.7919 16.6934 22.4452 18.6668C21.0986 20.6402 19.1846 22.1783 16.9452 23.0865C14.7059 23.9948 12.2417 24.2324 9.86443 23.7694C7.48713 23.3064 5.30344 22.1635 3.5895 20.4853C1.87557 18.807 0.708362 16.6689 0.235488 14.3411C-0.237386 12.0133 0.00531004 9.60051 0.932886 7.4078C1.86046 5.21508 3.43126 3.34094 5.44663 2.02236C7.46201 0.703788 9.83145 0 12.2553 0C15.5046 0.00335979 18.6198 1.26872 20.9173 3.51843C23.2149 5.76814 24.5072 8.81843 24.5106 12ZM22.6252 12C22.6252 9.99176 22.017 8.02861 20.8776 6.35882C19.7381 4.68903 18.1186 3.38759 16.2237 2.61907C14.3289 1.85055 12.2438 1.64947 10.2323 2.04126C8.2207 2.43305 6.37296 3.40011 4.92271 4.82015C3.47245 6.24019 2.48482 8.04943 2.08469 10.0191C1.68457 11.9887 1.88993 14.0303 2.6748 15.8857C3.45967 17.7411 4.78881 19.3269 6.49412 20.4426C8.19944 21.5583 10.2044 22.1538 12.2553 22.1538C15.0046 22.1508 17.6404 21.08 19.5845 19.1765C21.5285 17.2729 22.6221 14.692 22.6252 12Z" fill="#4318FF" />
                            </svg>

                            <span className="sr-only">Close modal</span>
                        </button>
                    </div>

                    <div className="p-4 md:p-5 space-y-4">
                        <div className="bg-white border border-gray-200 rounded-[16px] shadow-[rgba(17,_17,_26,_0.1)_0px_0px_16px] p-4 mb-2">
                            <label
                                htmlFor="message"
                                className="block mb-2 text-sm font-medium text-gray-900"
                            >
                                What would you like to generate ? <span className="text-[#F6292D] text-sm">*</span>
                            </label>
                            <textarea
                                id="message"
                                rows={3}
                                value={message}
                                onChange={handleMessageChange}
                                className="block p-4 w-full text-sm bg-gray-50 rounded-lg border border-[#E0E5F2] focus:ring-blue-500 focus:border-blue-500 resize-none placeholder:text-[#8D95A4]"
                                placeholder="Specify your changes, like improving clarity, adding details, simplifying language, or refining objectives."
                            />
                            <button
                                type="button"
                                onClick={handleGenerateAI}
                                className="text-white bg-[linear-gradient(135deg,_#868CFF_0%,_#4318FF_100%)] hover:bg-[linear-gradient(135deg,_#6A7FFF_0%,_#2A1CFF_100%)] focus:ring-1 focus:outline-none focus:ring-blue-300 font-normal rounded-full text-sm px-5 py-2 text-center mt-4"
                            >
                                <img className="inline-block me-2 w-[18.33px] align-top" src={Icons.gen_ai_icon} alt="gen_ai_icon.svg" />
                                Generate
                            </button>
                        </div>
                        {/* <div className="mt-2">
                            <h2 className="text-base font-bold">Suggestions</h2>
                            <ul className="max-w-md space-y-6 list-inside my-4 ms-2.5">
                                {SuggestionsList.map((list, index) => (
                                    <li key={index} className="flex items-center text-[#4318FF] text-sm font-semibold gap-4">
                                        <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M10.679 1.59375L11.8004 6.36238C12.1727 7.94539 13.4088 9.18163 14.9918 9.55377L19.7604 10.6753L14.9918 11.7967C13.4088 12.169 12.1725 13.4051 11.8004 14.9881L10.679 19.7567L9.55768 14.9881C9.18534 13.4051 7.94929 12.1688 6.36628 11.7967L1.59766 10.6753L6.36628 9.55377C7.94929 9.18143 9.18554 7.94539 9.55768 6.36238L10.679 1.59375Z" fill="#4318FF" />
                                            <path d="M10.6787 0.353516L10.8946 6.11601C10.9831 8.47794 12.8774 10.3722 15.2394 10.4607L21.0018 10.6767L15.2394 10.8927C12.8774 10.9812 10.9831 12.8755 10.8946 15.2374L10.6787 20.9999L10.4627 15.2374C10.3742 12.8755 8.4799 10.9812 6.11796 10.8927L0.355469 10.6767L6.11796 10.4607C8.4799 10.3722 10.3742 8.47794 10.4627 6.11601L10.6787 0.353516Z" fill="#8266FF" />
                                        </svg>
                                        {list}
                                    </li>
                                ))}
                            </ul>
                        </div> */}
                    </div>
                </div>
            </div>
        </div>
    );
};


const StyleGuideAccordion: React.FC = () => {
    const accordionItems: any[] = [
        {
            id: '1',
            title: 'Content accuracy',
            content: `
                <ul class="space-y-1 list-disc list-inside -indent-[18px] ms-4">
                    <li>Ensure that all information provided in questions, answers, and explanations is accurate, logical, up-to-date, and factually correct.</li>
                    <li>Double-check key facts, figures, and terminology to avoid misinformation.</li>
                </ul>
                <p class="my-2">Example: If a question is about the boiling point of water, it should state: "At standard atmospheric pressure, water boils at 100°C (212°F)."</p>
                <p>Misleading details, such as "Water typically boils at 110°C", should be avoided unless they clarify conditions that alter boiling points, such as changes in altitude.</p>
            `
        },
        {
            id: '2',
            title: 'Language and tone',
            content: ''
        },
        {
            id: '3',
            title: 'Question format',
            content: ''
        },
        {
            id: '4',
            title: 'Answer option clarity',
            content: ''
        },
        {
            id: '5',
            title: 'Grammar and punctuation',
            content: ''
        },
        {
            id: '6',
            title: 'Terminology consistency',
            content: ''
        },
        {
            id: '7',
            title: 'Cultural sensitivity and inclusivity',
            content: ''
        },
        {
            id: '8',
            title: 'Length and brevity',
            content: ''
        },
        {
            id: '9',
            title: 'Bloom\'s Taxonomy Levels',
            content: ''
        }
    ];

    const [openItems, setOpenItems] = useState<{ [key: string]: boolean }>({
        '1': false
    });

    const toggleAccordion = (id: string) => {
        setOpenItems(prevState => ({
            ...prevState,
            [id]: !prevState[id]
        }));
    };

    return (
        <div data-accordion="collapse" className="overflow-auto h-[330px] scrollbar pe-2">
            {accordionItems.map((item, index) => (
                <div key={item.id} className="mt-2 rounded-[16px] shadow-[rgba(17,_17,_26,_0.1)_0px_0px_16px]">
                    <h2 id={`accordion-collapse-heading-${item.id}`}>
                        <button
                            type="button"
                            className={`flex items-center justify-between w-full p-2 font-medium gap-3 focus-visible:outline-none`}
                            onClick={() => toggleAccordion(item.id)}
                            aria-expanded={openItems[item.id] || false}
                            aria-controls={`accordion-collapse-body-${item.id}`}
                        >
                            <span className="text-[#40444D] text-sm font-semibold">{item.title}</span>

                            <svg className={`${openItems[item.id] ? '' : 'rotate-180'}`} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8 8.54L6.1 6.64C5.95333 6.49333 5.77 6.42 5.55 6.42C5.33 6.42 5.14 6.49333 4.98 6.64C4.82 6.8 4.74 6.99 4.74 7.21C4.74 7.43 4.82 7.62 4.98 7.78L7.44 10.24C7.6 10.4 7.78667 10.48 8 10.48C8.21333 10.48 8.4 10.4 8.56 10.24L11.04 7.76C11.2 7.6 11.2767 7.41333 11.27 7.2C11.2633 6.98667 11.18 6.8 11.02 6.64C10.86 6.49333 10.6733 6.41667 10.46 6.41C10.2467 6.40333 10.06 6.48 9.9 6.64L8 8.54ZM8 16C6.89333 16 5.85333 15.79 4.88 15.37C3.90667 14.95 3.06 14.38 2.34 13.66C1.62 12.94 1.05 12.0933 0.63 11.12C0.21 10.1467 0 9.10667 0 8C0 6.89333 0.21 5.85333 0.63 4.88C1.05 3.90667 1.62 3.06 2.34 2.34C3.06 1.62 3.90667 1.05 4.88 0.63C5.85333 0.21 6.89333 0 8 0C9.10667 0 10.1467 0.21 11.12 0.63C12.0933 1.05 12.94 1.62 13.66 2.34C14.38 3.06 14.95 3.90667 15.37 4.88C15.79 5.85333 16 6.89333 16 8C16 9.10667 15.79 10.1467 15.37 11.12C14.95 12.0933 14.38 12.94 13.66 13.66C12.94 14.38 12.0933 14.95 11.12 15.37C10.1467 15.79 9.10667 16 8 16ZM8 14.4C9.78667 14.4 11.3 13.78 12.54 12.54C13.78 11.3 14.4 9.78667 14.4 8C14.4 6.21333 13.78 4.7 12.54 3.46C11.3 2.22 9.78667 1.6 8 1.6C6.21333 1.6 4.7 2.22 3.46 3.46C2.22 4.7 1.6 6.21333 1.6 8C1.6 9.78667 2.22 11.3 3.46 12.54C4.7 13.78 6.21333 14.4 8 14.4Z" fill="#4318FF" />
                            </svg>

                        </button>
                    </h2>
                    <div
                        id={`accordion-collapse-body-${item.id}`}
                        className={openItems[item.id] ? '' : 'hidden'}
                        aria-labelledby={`accordion-collapse-heading-${item.id}`}
                    >
                        <div className={`p-2`}>
                            <div className="mb-2 text-[#40444D] text-sm" dangerouslySetInnerHTML={{ __html: item.content }} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

interface ICourseLOModal {
    isOpen: boolean;
    onClose: () => void;
    tocData: any
}

const CourseLOModal: React.FC<ICourseLOModal> = ({
    isOpen,
    onClose,
    tocData
}) => {




    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex justify-center items-center overflow-y-auto bg-[#000000] bg-opacity-50"
            onClick={onClose}
        >
            <div className="relative w-full max-w-2xl p-4 max-h-full">
                <div
                    className="relative bg-white shadow-sm rounded-2xl"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between p-4 rounded-t-2xl">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Course : CLCS 605 - Cloud Computing: Unit 1: Cloud Computing...
                        </h3>
                        <button
                            type="button"
                            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
                            onClick={onClose}
                        >
                            <svg
                                className="w-3 h-3"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 14 14"
                            >
                                <path
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                                />
                            </svg>
                            <span className="sr-only">Close modal</span>
                        </button>
                    </div>

                    <TOCAccordionModal item={tocData} onChange={() => { }} />
                </div>
            </div>
        </div>
    );
};

interface IPreview {
    isOpen: boolean;
    onClose: () => void;
    tocData: any[];
    //onSetValue: (value: string) => void;
}
const Preview: React.FC<IPreview> = ({ isOpen, tocData, onClose }) => {
    const courseName = useSelector((state: RootState) => state.courseCreation.courseName);
    //const lastSelectedModule = useSelector((state: RootState) => state.editor.lastSelectedModule);
    //const moduleSelectionData = useSelector((state: RootState) => state.editor.moduleSelectionData);
    const moduleSelectionData = useState<any[]>([]);

    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [scrollPercentage, setScrollPercentage] = useState<number>(0);

    const [previewAllModules, setPreviewAlModules] = useState<boolean>(false);
    const [preset, setPreset] = useState('desktop');
    const [moduleDataList, setModuleDataList] = useState<any[]>([]);
    const [htmlContent, setHtmlContent] = useState<string>('');
    const [isShowToc, setShowToc] = useState<boolean>(true);

    const [currentPageId, setCurrentPageId] = useState<string | null>(null);

    const [presetViewHeigh, setPresetViewHeigh] = useState<string>('');

    const presets: any = {
        desktop: {
            width: '100%',
            height: 'auto',
            //icon: Monitor,
            label: 'Desktop'
        },
        'tablet-portrait': {
            width: '768px',
            height: '100%',
            //icon: Tablet,
            label: 'Tablet Portrait'
        },
        'tablet-landscape': {
            width: '1024px',
            height: '100%',
            //icon: Tablet,
            label: 'Tablet Landscape'
        },
        'mobile-portrait': {
            width: '430px',
            height: '100%',
            //icon: Smartphone,
            label: 'Mobile Portrait'
        },
        'mobile-landscape': {
            width: '932px',
            height: '430px',
            //icon: Smartphone,
            label: 'Mobile Landscape'
        }
    };

    const getCurrentDimensions = () => {
        return presets[preset];
    };

    const dimensions = getCurrentDimensions();
    const isDesktop = preset === 'desktop';

    const groupHTMLBySections = (htmlString: string) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlString, 'text/html');

        const sections: HTMLElement[] = [];
        let currentSection: HTMLElement | null = null;
        let lastWasHeading = false;
        let lastWasParagraph = false; // Track if the last element was a paragraph

        doc.body.childNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node as HTMLElement;

                if (['H2', 'H3', 'H4', 'H5', 'H6'].includes(element.tagName)) {
                    // Create a new section for the heading
                    currentSection = document.createElement('section');
                    currentSection.appendChild(element.cloneNode(true));
                    sections.push(currentSection);
                    lastWasHeading = true;
                    lastWasParagraph = false; // Reset paragraph tracking
                } else if (lastWasHeading && ['P', 'UL', 'OL'].includes(element.tagName)) {
                    // If last element was a heading, group the first P, UL, or OL
                    currentSection?.appendChild(element.cloneNode(true));
                    lastWasHeading = false;
                    lastWasParagraph = element.tagName === 'P'; // Mark if P was added
                } else if (lastWasParagraph && ['UL', 'OL'].includes(element.tagName)) {
                    // If last element was a P, group the UL/OL with it
                    currentSection?.appendChild(element.cloneNode(true));
                    lastWasParagraph = false; // Reset tracking after grouping
                } else {
                    // Create a new section for everything else
                    currentSection = document.createElement('section');
                    currentSection.appendChild(element.cloneNode(true));
                    sections.push(currentSection);
                    lastWasHeading = false;
                    lastWasParagraph = element.tagName === 'P'; // Track if P was added
                }
            }
        });

        return sections;
    };

    const _getTopicDetailsbyId = async (topicId: string): Promise<any | undefined> => {
        try {
            const response = await axiosInstance.get(`/topic/${topicId}`);

            if (response.status === 200) {
                if (response.data.data.pages && response.data.data.pages.length > 0) {
                    return { htmlContent: response.data.data.pages[0].htmlContent, pageId: response.data.data.pages[0].pageId };
                }
            }
        } catch (error) {
            console.log(error);
        }
    }

    const _getPageDetailsbyId = async (pageId: string): Promise<any | undefined> => {
        try {
            const repsonse = await axiosInstance.get(`/page/${pageId}`);

            if (repsonse.status === 200) {
                if (repsonse.data.data) {
                    return { htmlContent: repsonse.data.data.htmlContent, pageId: repsonse.data.data.pageId };
                }
            }
        } catch (error) {
            console.log(error);
        }
    }

    const _getAssessmentDetailsbyId = async (assessmentId: string): Promise<any | undefined> => {
        try {
            const repsonse = await axiosInstance.get(`/assessment/${assessmentId}`);

            if (repsonse.status === 200) {
                return { htmlContent: repsonse.data.data.htmlContent, pageId: repsonse.data.data.assessmentId }
            }
        } catch (error) {
            console.log(error);
        }
    }

    const loadContent = async (topicId: string, nodeType: string) => {
        const response = nodeType === 'page' ? await _getPageDetailsbyId(topicId) : nodeType === "assessment" ? await _getAssessmentDetailsbyId(topicId) : await _getTopicDetailsbyId(topicId);

        const parser = new DOMParser();
        const doc = parser.parseFromString(response.htmlContent, "text/html");

        const clonedDoc = doc.cloneNode(true) as Document;

        clonedDoc.querySelectorAll('script[src="/@vite/client"], script[type="module"]').forEach(script => {
            script.remove();
        });

        const scrollBarStyle = clonedDoc.createElement('style');
        scrollBarStyle.textContent = `
                        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Dynalight&family=Erica+One&display=swap');

                        body::-webkit-scrollbar {
                            width: 5px;
                            height: 5px;
                        }

                        body::-webkit-scrollbar-track {
                            background: white;
                            border-radius: 12px;
                        }

                        body::-webkit-scrollbar-thumb {
                            background: #40444d;
                            border-radius: 12px;
                            cursor: pointer;
                        }

                        body{
                            font-family: 'DM Sans', sans-serif;
                            font-size: 14px;
                            /*padding: 18px !important;*/
                        }
                        body * {
                            line-height: 24px;
                            color: #40444D;
                        }
                        section {
                            background: #F9FAFF;
                            border: 1px solid #E0E5F2;
                            margin-bottom: 30px;
                            padding: 8px 12px;
                            border-radius: 10px;
                        }
                        h1 *, h2 *, h3 *, h4 *, h5 *, h6 * {
                            color: black;
                        }
                    `;

        clonedDoc.documentElement.querySelector('head')!.appendChild(scrollBarStyle);

        const previewHtml = clonedDoc.body.innerHTML;

        let sectionHTMLs = "";

        if (clonedDoc.body.querySelectorAll('section').length > 0) {
            sectionHTMLs = previewHtml;
        } else {
            sectionHTMLs = groupHTMLBySections(previewHtml).map(section => section.outerHTML).join(' ');
        }

        clonedDoc.body.innerHTML = sectionHTMLs;

        setHtmlContent(clonedDoc.documentElement.outerHTML);

        if (preset === 'mobile-portrait') {
            setShowToc(false);
        }

    }

    const handleChangePreview = (pageId: string, nodeType: string) => {
        if (pageId) {
            setHtmlContent('');
            setScrollPercentage(0);
            loadContent(pageId, nodeType);
            setCurrentPageId(pageId);
        }
    }

    const handlePreset = (preset: string) => {
        setPreset(preset);
        setShowToc(true);
        if (previewAllModules && preset === 'mobile-portrait') {
            setShowToc(false);
        } else {
            setShowToc(true);
        }

        if (preset === 'mobile-portrait' && !previewAllModules) {
            setPresetViewHeigh('h-[80%]');
        } else if (preset === 'mobile-portrait') {
            setPresetViewHeigh('h-[87%]');
        } else if (!previewAllModules) {
            setPresetViewHeigh('h-[80%]');
        } else if (preset === 'mobile-landscape') {
            setPresetViewHeigh('h-[79%]');
        } else if (preset === 'desktop' && previewAllModules) {
            setPresetViewHeigh('h-[77%]');
        } else {
            setPresetViewHeigh('h-[87%]');
        }
    }

    /* useEffect(() => {
        //console.log(moduleSelectionData);
        const moduleList = tocData.map(list => {
            return {
                module_name: list.module_name,
                //module_learning_objective: list.module_learning_objective,
                //topic_names: list.topics.map((topic: any) => ({ name: topic.type === "module" ? topic.pageTitle : topic.name, pageId: topic.pageId, scrollPercentage: 0 })),
            }
        });

        setModuleDataList(moduleList);

    }, [tocData]); */

    useEffect(() => {
        const iframe = iframeRef.current;

        if (!iframe) return;

        const handleScroll = () => {
            if (iframe?.contentWindow) {
                const contentWindow = iframe.contentWindow;
                const scrollTop = contentWindow.scrollY || contentWindow.document.documentElement.scrollTop;
                const scrollHeight = contentWindow.document.documentElement.scrollHeight;
                const clientHeight = contentWindow.document.documentElement.clientHeight;

                const scrollPercentage = Math.min(
                    Math.max((scrollTop / (scrollHeight - clientHeight)) * 100, 0),
                    100
                );

                setScrollPercentage(Math.round(scrollPercentage));
            }
        };

        const handleLoad = () => {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
            if (iframeDoc) {
                iframeDoc.addEventListener('scroll', handleScroll);
            }
        };

        iframe.addEventListener('load', handleLoad);

        return () => {
            iframe.removeEventListener('load', handleLoad);
            const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
            if (iframeDoc) {
                iframeDoc.removeEventListener('scroll', handleScroll);
            }
        };
    }, [previewAllModules]);

    const updateScrollPercentage = (pageId: string, newScrollPercentage: number) => {
        for (const module of moduleDataList) {
            const topic = module.topic_names.find((topic: any) => topic.pageId === pageId);
            if (topic) {
                if (newScrollPercentage > topic.scrollPercentage) {
                    topic.scrollPercentage = newScrollPercentage;
                }
                return true;
            }
        }
        return false;
    };


    useEffect(() => {
        updateScrollPercentage(currentPageId!, scrollPercentage);
    }, [scrollPercentage]);

    useEffect(() => {
        if (isOpen) {
            setPreviewAlModules(false);
            setPresetViewHeigh('h-[90%]')
            setPreset('desktop');
            setShowToc(true)

            setHtmlContent('');
            loadContent(tocData[0].topic_names[0].topicId, tocData[0].topic_names[0].nodeType);
            const moduleList = tocData.map(list => {
                return {
                    module_name: list.module_name,
                    //module_learning_objective: list.module_learning_objective,
                    topic_names: list.topic_names.map((topic: any) => ({ name: topic.type === "module" ? topic.pageTitle : topic.name, pageId: topic.topicId, nodeType: topic.nodeType, scrollPercentage: 0 })),
                }
            });

            setModuleDataList(moduleList);
            setCurrentPageId(tocData[0].topic_names[0].topicId);
            //console.log(tocData);
        }
    }, [isOpen]);


    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 transition-opacity z-40"
                // onClick={onClose}
                />
            )}
            <div
                className={`fixed top-0 right-0 z-40 h-screen transition-transform duration-300 ease-in-out w-[94%] bg-white ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
                tabIndex={-1}
                aria-labelledby="drawer-right-label"
            >
                <div className="flex justify-between items-center bg-[#F2F4FF] p-5">
                    <h5
                        id="drawer-right-label"
                        className="text-xl items-center font-bold"
                    >
                        Course Preview: {courseName}
                    </h5>

                    <div className="flex items-center">
                        <ul className="list-none list-inside space-x-2 flex me-8">
                            <li>
                                <a className="cursor-pointer" onClick={() => handlePreset('desktop')}>
                                    <img src={preset === 'desktop' ? Icons.destop_selected_icon : Icons.destop_icon} alt="destop_icon.svg" />
                                </a>
                            </li>
                            <li>
                                <a className="cursor-pointer" onClick={() => handlePreset('tablet-portrait')}>
                                    <img src={preset === 'tablet-portrait' ? Icons.tablet_portrait_selected_icon : Icons.tablet_portrait_icon} alt="destop_icon.svg" />
                                </a>
                            </li>
                            <li>
                                <a className="cursor-pointer" onClick={() => handlePreset('tablet-landscape')}>
                                    <img src={preset === 'tablet-landscape' ? Icons.tablet_landscape_selected_icon : Icons.tablet_landscape_icon} alt="destop_icon.svg" />
                                </a>
                            </li>
                            <li>
                                <a className="cursor-pointer" onClick={() => handlePreset('mobile-portrait')}>
                                    <img src={preset === 'mobile-portrait' ? Icons.mobile_portrait_selected_icon : Icons.mobile_portrait_icon} alt="destop_icon.svg" />
                                </a>
                            </li>
                            <li>
                                <a className="cursor-pointer" onClick={() => handlePreset('mobile-landscape')}>
                                    <img src={preset === 'mobile-landscape' ? Icons.mobile_landscape_selected_icon : Icons.mobile_landscape_icon} alt="destop_icon.svg" />
                                </a>
                            </li>
                        </ul>
                        <button
                            onClick={onClose}
                            type="button"
                            className="bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-full text-sm w-8 h-8">
                            <img src={Images.circle_cross_icon} alt="circle_cross_icon" />
                            <span className="sr-only">Close menu</span>
                        </button>
                    </div>
                </div>
                <div className="h-[86%] flex p-4">
                    <div
                        className={`border border-gray-200 rounded-[16px] shadow-2xl bg-white  relative transition-all duration-300 m-auto ${isDesktop ? 'w-full' : ''} ${preset === 'mobile-portrait' ? preset : ''}`}
                        style={{
                            width: dimensions.width,
                            height: isDesktop ? '100%' : dimensions.height,
                            // maxWidth: '100%',
                            //maxHeight: isDesktop ? 'none' : 'calc(100vh - 200px)',
                            //transform: isDesktop ? 'none' : 'scale(0.8)',
                            zoom: isDesktop ? 'none' : '90%',
                            transformOrigin: 'center center'
                        }}
                    >
                        <div className="h-full">
                            <div className="h-full flex-row">
                                {!previewAllModules && <>
                                    {(preset !== 'mobile-portrait' && preset !== 'mobile-landscape') && <>
                                        <div style={{ 'background': `url(${Images.preview_image})` }} className="h-[145px] rounded-tl-[26px] rounded-tr-[26px]">
                                        </div>
                                        <div className="border p-4 shadow-[0px_7px_29px_0px_#64646F33]">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <h5
                                                        id="drawer-right-label"
                                                        className="text-xl items-center font-bold text-[#4318FF] flex gap-2"
                                                    >
                                                        <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M14.0033 18.4695C14.7758 18.0904 15.5526 17.806 16.3339 17.6164C17.1151 17.4268 17.9183 17.332 18.7434 17.332C19.3754 17.332 19.9942 17.3862 20.5999 17.4945C21.2056 17.6029 21.8156 17.7654 22.4301 17.982V7.25703C21.8507 7.00425 21.2494 6.81467 20.6262 6.68828C20.003 6.56189 19.3754 6.4987 18.7434 6.4987C17.9183 6.4987 17.1019 6.60703 16.2944 6.8237C15.4868 7.04036 14.7231 7.36536 14.0033 7.7987V18.4695ZM12.95 21.0966C12.7042 21.0966 12.4716 21.065 12.2522 21.0018C12.0327 20.9386 11.8264 20.8529 11.6333 20.7445C10.9487 20.3293 10.2289 20.0178 9.47399 19.8102C8.7191 19.6025 7.94665 19.4987 7.15664 19.4987C6.41931 19.4987 5.69514 19.598 4.98413 19.7966C4.27313 19.9952 3.59285 20.2751 2.94329 20.6362C2.57462 20.8348 2.21912 20.8258 1.87678 20.6091C1.53445 20.3924 1.36328 20.0765 1.36328 19.6612V6.60703C1.36328 6.40842 1.41156 6.21884 1.50812 6.03828C1.60467 5.85773 1.74951 5.72231 1.94262 5.63203C2.76773 5.21675 3.61479 4.89627 4.4838 4.67057C5.3528 4.44488 6.24375 4.33203 7.15664 4.33203C8.17487 4.33203 9.17115 4.46745 10.1455 4.73828C11.1198 5.00911 12.0547 5.41536 12.95 5.95703C13.8453 5.41536 14.7802 5.00911 15.7545 4.73828C16.7289 4.46745 17.7251 4.33203 18.7434 4.33203C19.6563 4.33203 20.5472 4.44488 21.4162 4.67057C22.2852 4.89627 23.1323 5.21675 23.9574 5.63203C24.1505 5.72231 24.2953 5.85773 24.3919 6.03828C24.4885 6.21884 24.5367 6.40842 24.5367 6.60703V19.6612C24.5367 20.0765 24.3656 20.3924 24.0232 20.6091C23.6809 20.8258 23.3254 20.8348 22.9567 20.6362C22.3072 20.2751 21.6269 19.9952 20.9159 19.7966C20.2049 19.598 19.4807 19.4987 18.7434 19.4987C17.9534 19.4987 17.1809 19.6025 16.426 19.8102C15.6711 20.0178 14.9514 20.3293 14.2667 20.7445C14.0736 20.8529 13.8673 20.9386 13.6478 21.0018C13.4284 21.065 13.1958 21.0966 12.95 21.0966ZM15.0567 9.50495C15.0567 9.34245 15.1137 9.17543 15.2279 9.00391C15.342 8.83238 15.4692 8.71953 15.6097 8.66536C16.1188 8.48481 16.6279 8.34939 17.137 8.25911C17.6461 8.16884 18.1816 8.1237 18.7434 8.1237C19.0945 8.1237 19.4412 8.14627 19.7835 8.19141C20.1259 8.23655 20.4638 8.29523 20.7974 8.36745C20.9554 8.40356 21.0914 8.49384 21.2056 8.63828C21.3197 8.78273 21.3767 8.94523 21.3767 9.12578C21.3767 9.43273 21.2802 9.65842 21.087 9.80286C20.8939 9.94731 20.6482 9.98342 20.3497 9.9112C20.1039 9.85703 19.845 9.81641 19.5729 9.78932C19.3008 9.76224 19.0243 9.7487 18.7434 9.7487C18.2869 9.7487 17.8393 9.79384 17.4004 9.88411C16.9615 9.97439 16.5401 10.0918 16.1364 10.2362C15.8204 10.3626 15.5614 10.3536 15.3595 10.2091C15.1576 10.0647 15.0567 9.82995 15.0567 9.50495ZM15.0567 15.4633C15.0567 15.3008 15.1137 15.1338 15.2279 14.9622C15.342 14.7907 15.4692 14.6779 15.6097 14.6237C16.1188 14.4431 16.6279 14.3077 17.137 14.2174C17.6461 14.1272 18.1816 14.082 18.7434 14.082C19.0945 14.082 19.4412 14.1046 19.7835 14.1497C20.1259 14.1949 20.4638 14.2536 20.7974 14.3258C20.9554 14.3619 21.0914 14.4522 21.2056 14.5966C21.3197 14.7411 21.3767 14.9036 21.3767 15.0841C21.3767 15.3911 21.2802 15.6168 21.087 15.7612C20.8939 15.9056 20.6482 15.9418 20.3497 15.8695C20.1039 15.8154 19.845 15.7747 19.5729 15.7477C19.3008 15.7206 19.0243 15.707 18.7434 15.707C18.2869 15.707 17.8393 15.7477 17.4004 15.8289C16.9615 15.9102 16.5401 16.023 16.1364 16.1674C15.8204 16.2938 15.5614 16.2893 15.3595 16.1539C15.1576 16.0185 15.0567 15.7883 15.0567 15.4633ZM15.0567 12.4841C15.0567 12.3216 15.1137 12.1546 15.2279 11.9831C15.342 11.8115 15.4692 11.6987 15.6097 11.6445C16.1188 11.464 16.6279 11.3286 17.137 11.2383C17.6461 11.148 18.1816 11.1029 18.7434 11.1029C19.0945 11.1029 19.4412 11.1254 19.7835 11.1706C20.1259 11.2157 20.4638 11.2744 20.7974 11.3466C20.9554 11.3827 21.0914 11.473 21.2056 11.6174C21.3197 11.7619 21.3767 11.9244 21.3767 12.1049C21.3767 12.4119 21.2802 12.6376 21.087 12.782C20.8939 12.9265 20.6482 12.9626 20.3497 12.8904C20.1039 12.8362 19.845 12.7956 19.5729 12.7685C19.3008 12.7414 19.0243 12.7279 18.7434 12.7279C18.2869 12.7279 17.8393 12.773 17.4004 12.8633C16.9615 12.9536 16.5401 13.0709 16.1364 13.2154C15.8204 13.3418 15.5614 13.3327 15.3595 13.1883C15.1576 13.0438 15.0567 12.8091 15.0567 12.4841Z" fill="#4318FF" />
                                                        </svg>

                                                        <span>{courseName}</span>
                                                    </h5>
                                                </div>
                                                <div>
                                                    <button
                                                        onClick={() => {
                                                            setPresetViewHeigh('h-[77%]')
                                                            setPreviewAlModules(true);
                                                        }}
                                                        type="button"
                                                        className="text-white bg-[linear-gradient(135deg,_#868CFF_0%,_#4318FF_100%)] hover:bg-[linear-gradient(135deg,_#6A7FFF_0%,_#2A1CFF_100%)] focus:ring-1 focus:outline-none focus:ring-blue-300 font-bold rounded-full text-sm px-6 py-2.5 text-center"
                                                    >
                                                        Start a course
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </>}
                                </>}

                                <div className={`p-4 text-sm ${preset === 'mobile-portrait' ? 'h-[97%]' : preset === 'mobile-landscape' ? 'h-[87%]' : previewAllModules ? 'h-full' : 'h-[65%]'}`}>
                                    {!previewAllModules &&
                                        <>
                                            {(preset !== 'mobile-portrait' && preset !== 'mobile-landscape')
                                                ? <p>This course the structured learning path for CLCS 605 - Cloud Computing. It includes key units, topics, and lessons covering cloud infrastructure, understanding of cloud technologies.</p>
                                                : <h2 className="text-xl font-bold mt-6">{courseName}</h2>
                                            }
                                        </>
                                    }
                                    <div className={`${previewAllModules ? 'flex gap-2' : ''}  h-full`}>
                                        <div className={`h-full ${(isShowToc && preset) === 'mobile-portrait' ? 'absolute bg-white w-[93%] h-[95%]' : ''}`}>
                                            {previewAllModules &&
                                                <>
                                                    {isShowToc &&
                                                        <>
                                                            <div style={{ 'background': `url(${Images.preview_image}) no-repeat`, 'backgroundSize': 'cover' }} className="relative h-[82px] rounded-tl-[26px] rounded-tr-[26px]">
                                                                <button className="absolute right-3 top-2 bg-white border border-white rounded-full w-8 h-8" onClick={() => setShowToc(false)}>
                                                                    <svg className="m-auto" width="9" height="14" viewBox="0 0 9 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                        <path d="M2.9751 6.9838L7.8606 2.0983C8.0903 1.8686 8.2051 1.5763 8.2051 1.2214C8.2051 0.866499 8.0903 0.5742 7.8606 0.3445C7.631 0.1149 7.3387 0 6.9837 0C6.6288 0 6.3365 0.1149 6.1069 0.3445L0.344501 6.1069C0.219201 6.2322 0.1305 6.3679 0.0783005 6.514C0.0261005 6.6602 0 6.8168 0 6.9838C0 7.1508 0.0261005 7.3074 0.0783005 7.4535C0.1305 7.5997 0.219201 7.7354 0.344501 7.8607L6.1069 13.623C6.3365 13.8527 6.6288 13.9675 6.9837 13.9675C7.3387 13.9675 7.631 13.8527 7.8606 13.623C8.0903 13.3934 8.2051 13.1011 8.2051 12.7462C8.2051 12.3912 8.0903 12.0989 7.8606 11.8693L2.9751 6.9838Z" fill="#4318FF" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                            <p className="flex justify-between p-2 shadow-[0px_7px_29px_0px_#64646F33]">
                                                                <span className="truncate text-sm text-[#4318FF] font-semibold">{courseName}</span>
                                                                <span className="text-sm">{scrollPercentage}% complete</span>
                                                            </p>
                                                        </>
                                                    }
                                                    {(!isShowToc && preset !== 'mobile-portrait') &&
                                                        <button className="relative top-2 bg-white border border-white rounded-full w-8 h-8 shadow-[0px_8px_24px_0px_#959DA533]" onClick={() => setShowToc(true)}>
                                                            <svg className="m-auto" width="9" height="14" viewBox="0 0 9 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M5.97217 6.99938L1.08668 2.11388C0.857018 1.88422 0.742188 1.59193 0.742188 1.237C0.742188 0.88207 0.857018 0.589775 1.08668 0.360115C1.31634 0.130455 1.60863 0.015625 1.96356 0.015625C2.31849 0.015625 2.61079 0.130455 2.84045 0.360115L8.60283 6.1225C8.7281 6.24777 8.81683 6.38347 8.86902 6.52962C8.92122 6.67577 8.94732 6.83235 8.94732 6.99938C8.94732 7.16641 8.92122 7.32299 8.86902 7.46914C8.81683 7.61529 8.7281 7.75099 8.60283 7.87626L2.84045 13.6386C2.61079 13.8683 2.31849 13.9831 1.96356 13.9831C1.60863 13.9831 1.31634 13.8683 1.08668 13.6386C0.857018 13.409 0.742188 13.1167 0.742188 12.7618C0.742188 12.4068 0.857018 12.1145 1.08668 11.8849L5.97217 6.99938Z" fill="#4318FF" />
                                                            </svg>
                                                        </button>
                                                    }
                                                </>
                                            }
                                            <div className={`overflow-auto scrollbar my-2 ${presetViewHeigh} pe-2`}>
                                                {isShowToc && <PreviewTocAccordion item={moduleDataList} onChange={(pageId: string, nodeType: string) => handleChangePreview(pageId, nodeType)} />}
                                            </div>
                                            {(!previewAllModules && preset === 'mobile-portrait') &&
                                                <button
                                                    onClick={() => setPreviewAlModules(true)}
                                                    type="button"
                                                    className="text-white bg-[linear-gradient(135deg,_#868CFF_0%,_#4318FF_100%)] hover:bg-[linear-gradient(135deg,_#6A7FFF_0%,_#2A1CFF_100%)] focus:ring-1 focus:outline-none focus:ring-blue-300 font-bold rounded-full text-sm px-6 py-2.5 text-center"
                                                >
                                                    Start a course
                                                </button>
                                            }
                                        </div>
                                        {previewAllModules &&
                                            <div className={`flex-grow-0 ${preset === 'mobile-portrait' ? 'w-full' : !isShowToc ? 'w-[100%]' : 'w-[80%]'}`}>
                                                {preset === 'mobile-portrait' &&
                                                    <button
                                                        onClick={() => setShowToc(true)}
                                                        type="button"
                                                        className="flex gap-2 items-center text-[#4318FF] text-sm bg-white font-bold border border-[#4318FF] focus:outline-none hover:bg-gray-200 focus:ring-1 focus:ring-[#4318FF] rounded-full px-4 py-2 me-4"
                                                    >
                                                        <span>Units</span>
                                                        <img className="align-top" src={Icons.b_menu} alt="gen_ai_icon.svg" />
                                                    </button>}
                                                <iframe
                                                    ref={iframeRef}
                                                    srcDoc={htmlContent}
                                                    title={"Device Screen"}
                                                    width={'100%'}
                                                    height={preset === 'mobile-portrait' ? '96%' : '100%'}
                                                    style={{ border: "none" }}
                                                />
                                                {/* {scrollPercentage} */}
                                            </div>
                                        }
                                    </div>
                                </div>


                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

type Size = 'xs' | 'sm' | 'md' | 'lg';
type Color = 'blue' | 'green' | 'red' | 'yellow';

interface CircularProgressProps {
    progress: number;
    size?: Size;
    color?: Color;
    className?: string;
}

interface CircleStyles {
    strokeDasharray: number;
    strokeDashoffset: number;
    transition: string;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
    progress = 0,
    size = 'md',
    color = 'blue',
    className = ''
}) => {
    const validProgress = Math.min(Math.max(0, progress), 100);

    const getSize = (): string => {
        switch (size) {
            case 'xs': return 'w-8 h-8';
            case 'sm': return 'w-10 h-10';
            case 'lg': return 'w-40 h-40';
            default: return 'w-32 h-32'; // medium
        }
    };

    const getStrokeWidth = (): number => {
        switch (size) {
            case 'xs': return 2;
            case 'sm': return 4;
            case 'lg': return 8;
            default: return 6; // medium
        }
    };

    const radius: number = size === 'xs' ? 10 : size === 'sm' ? 36 : size === 'lg' ? 72 : 56;
    const strokeWidth: number = getStrokeWidth();
    const normalizedRadius: number = radius - strokeWidth * 2;
    const circumference: number = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset: number = circumference - (validProgress / 100) * circumference;

    const getColorClasses = (): string => {
        switch (color) {
            case 'blue': return 'text-[#8D95A4] stroke-[#4318FF]';
            case 'green': return 'text-green-500 stroke-green-500';
            case 'red': return 'text-red-500 stroke-red-500';
            case 'yellow': return 'text-yellow-500 stroke-yellow-500';
            default: return 'text-blue-500 stroke-blue-500';
        }
    };

    const getFontSize = (): string => {
        switch (size) {
            case 'sm': return 'text-xl';
            case 'lg': return 'text-4xl';
            default: return 'text-2xl';
        }
    };

    const circleStyles: CircleStyles = {
        strokeDasharray: circumference,
        strokeDashoffset: strokeDashoffset,
        transition: 'stroke-dashoffset 0.5s ease'
    };

    return (
        <div className={`relative ${getSize()} flex items-center justify-center ${className}`}>
            <svg
                className={`transform -rotate-90 ${getSize()}`}
                viewBox={`0 0 ${radius * 2} ${radius * 2}`}
            >
                <circle
                    className="stroke-gray-200"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
                =                <circle
                    className={getColorClasses()}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    fill="transparent"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                    style={circleStyles}
                />
            </svg>
            <div className={`absolute flex flex-col items-center justify-center ${getColorClasses()}`}>
                <span className={`${getFontSize()} font-bold`}>
                    {/* {validProgress}% */}
                </span>
            </div>
        </div>
    );
};

interface AccordionItem {
    module_name: string;
    topics: string[];
    pageId: string;
    id: string;
}

interface IAccordionPreview {
    item: any[]
    onChange: (pageId: string, nodeType: string) => void;
}
const PreviewTocAccordion: React.FC<IAccordionPreview> = ({ item, onChange }) => {
    const [openItems, setOpenItems] = useState<string[]>([]);
    const [toc, setToc] = useState<AccordionItem[]>([]);
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

    const lastSelectedModule = useSelector((state: RootState) => state.editor.lastSelectedModule);

    const toggleItem = (id: string) => {
        setOpenItems(prev =>
            prev.includes(id)
                ? prev.filter(item => item !== id)
                : [...prev, id]
        );
    };

    const handleChangeTopic = (topic: any) => {
        setSelectedTopic(topic.pageId);
        onChange(topic.pageId, topic.nodeType);
    };

    const findModuleIdByPageId = (pageId: string): number | undefined => {
        for (const module of item) {
            for (const topic of module.topic_names) {
                if (topic.pageId === pageId) {
                    return module.id;
                }
            }
        }
        return undefined;
    };

    useEffect(() => {
        item.map((o, index) => o.id = (index + 1));
        setToc(item);

        const moduleId: any = findModuleIdByPageId(lastSelectedModule.pageId!);
        if (moduleId) {
            toggleItem(moduleId);
            setSelectedTopic(lastSelectedModule.pageId!);
        }
    }, [item, lastSelectedModule]);

    // If no items are provided, don't render anything
    if (!toc.length) {
        return null;
    }

    return (
        <div className="w-full h-full" data-accordion="collapse">
            {toc.map((item: any, index) => (
                <div key={item.id} className={`accordion-item bg-white relative mb-2 rounded-lg border ${openItems.includes(item.id) ? 'border-[#4318FF] shadow-[0px_7px_29px_0px_rgba(67,24,255,0.2)]' : 'shadow-sm'}`}>
                    <h2 id={`accordion-heading-${item.id}`} className="font-bold w-full border-b border-[#BFBAD9]">
                        <button
                            type="button"
                            className={`flex justify-between w-full p-2.5 text-sm font-bold text-left text-[#374373]`}
                            onClick={() => toggleItem(item.id)}
                            aria-expanded={openItems.includes(item.id)}
                            aria-controls={`accordion-body-${item.id}`}
                        >
                            <span>{item.module_name}</span>

                            <img
                                className={`shrink-0 transition-transform duration-200 ${openItems.includes(item.id) ? 'rotate-0' : 'rotate-180'}`}
                                src={Icons.toc_arrow}
                                alt="accordion_arrow.svg"
                            />
                        </button>
                    </h2>
                    <div
                        id={`accordion-body-${item.id}`}
                        className={`${openItems.includes(item.id) ? '' : 'hidden'}`}
                        aria-labelledby={`accordion-heading-${item.id}`}
                    >
                        <div className="border border-b-0 border-gray-200">
                            <ul className="list-none list-inside">
                                {item.topic_names.map((topic: any, index: number) => (
                                    <li
                                        key={index}
                                        className={`flex text-sm items-center gap-2 font-normal px-2 py-2.5 cursor-pointer hover:bg-gray-300`} //${selectedTopic === topic.pageId ? 'text-[#4318FF]' : ''}// Apply color if selected
                                        onClick={() => handleChangeTopic(topic)}
                                    >
                                        <CircularProgress progress={topic.scrollPercentage} size="xs" color="blue" />
                                        <span>{topic.name}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

interface IPublish {
    onIsloader: (state: boolean) => void;
    onShowPublish: (isShow: boolean) => void;
}
const Publish: React.FC<IPublish> = ({ onShowPublish, onIsloader }) => {
    const modalRef = useRef<HTMLDivElement | null>(null);
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const [step, setStep] = useState(1);
    const [showPopup, setShowPopup] = useState(false);
    const [selectedFormat, setIsetSelectedFormat] = useState<string>("docx");
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    const navigate = useNavigate();

    const courseName = useSelector((state: RootState) => state.courseCreation.courseName);
    const courseId = useSelector((state: RootState) => state.courseCreation.courseId);

    const downloadFile = (fileUrl: string, fileName: string) => {
        const link = document.createElement("a");
        link.href = fileUrl;
        link.download = fileName; // Suggested filename
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onShowPublish(false);
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onShowPublish(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);



    const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));


    const handlePublish = async () => {
        onIsloader(true);


        try {
            const response = await axiosInstance.post('/course/export', {
                courseId: courseId,
                format: selectedFormat,
            }, {
                headers: {
                    'userId': 'sdvsdsdvd23ssddsssdv',
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 200) {
                const filePath = response.data.data.file_path;
                const filename = filePath.split('/').pop();

                console.log(selectedFormat);
                console.log(filePath);

                // Wait 3 seconds before fetching
                await wait(3000);

                try {
                    const fileResponse = await fetch(filePath);
                    if (!fileResponse.ok) {
                        throw new Error(`Failed to fetch: ${fileResponse.status} ${fileResponse.statusText}`);
                    }

                    const blob: Blob = await fileResponse.blob();
                    saveAs(blob, filename);

                } catch (error) {
                    console.error("File download failed:", error);
                }
                onIsloader(false);
                setStep(3);
            }

        } catch (error) {
            console.error("Export request failed:", error);
        }
    };





    return (
        <div
            id="popup-modal"
            tabIndex={-1}
            className="fixed inset-0 z-50 flex justify-center items-center overflow-y-auto bg-[#000000] bg-opacity-50"
        >

            <div className="bg-[#FFFFFF] p-5 rounded-lg shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] w-[606px]  max-h-[80vh] overflow-y-auto scrollbar" ref={modalRef}>

                {step === 1 && (
                    <>

                        <div className='border border-gray-200 rounded-[16px]  p-5 mb-4 bg-white'><h2 className="text-lg font-semibold mb-3 text-[#4318FF]">Course: {courseName}</h2>
                            <p className='text-[#40444D]'>version:0</p>

                        </div>

                        <p className='text font-bold'>Please choose an option to publish</p>

                        <div className='border border-gray-200 rounded-[16px] p-5 mb-4 bg-white'>
                            <div className="flex items-center mb-3">
                                <input
                                    type="radio"
                                    id="publishOutline"
                                    name="publishOutline"
                                    className="mr-2"
                                />
                                <h3 className="font-semibold text-[16px] text-[#40444D] mb-0">
                                    Publish course outline
                                </h3>
                            </div>
                            <p className='text-[#40444D] text-[12px]'>
                                Share a high-level overview or structure of the course.
                            </p>
                        </div>
                        <div className='border border-gray-200 rounded-[16px] p-5 mb-4 bg-white'>
                            <div className="flex items-center mb-3">
                                <input
                                    type="radio"
                                    id="publishOutline"
                                    name="publishOutline"
                                    className="mr-2"
                                />
                                <h3 className="font-semibold text-[16px] text-[#40444D] mb-0">
                                    Publish module
                                </h3>
                            </div>
                            <p className='text-[#40444D] text-[12px] mb-2'>
                                Publish individual sections or units of the course for targeted learning.
                            </p>
                            <label htmlFor="module" className="text-[14px] text-[#1D1F23] font-semibold font-mt-3 block">
                                Module
                            </label>
                            <select
                                id="module"
                                name="module"
                                className="border border-gray-300 rounded-[12px] p-3 text-sm w-full mt-1 text-[#8D95A4]"
                                disabled={true}
                            >
                                <option value="">Select module</option>
                                <option value="module1">Module 1</option>
                                <option value="module2">Module 2</option>
                                <option value="module3">Module 3</option>
                            </select>

                        </div>
                        <div className='border border-gray-200 rounded-[16px] p-5 mb-4 bg-white'>
                            <div className="flex items-center mb-3">
                                <input
                                    type="radio"
                                    id="publishOutline"
                                    name="publishOutline"
                                    className="mr-2"
                                    defaultChecked={true}
                                />
                                <h3 className="font-semibold text-[16px] text-[#40444D] mb-0">
                                    Publish complete course
                                </h3>
                            </div>
                            <p className='text-[#40444D] text-[12px]'>
                                Finalize and release the entire course for learners.
                            </p>
                        </div>


                        <div className="flex justify-start items-center gap-3 mt-4">
                            <button
                                onClick={() => setStep(2)}
                                className="text-white bg-gradient-to-r from-[#868CFF] to-[#4318FF] hover:from-[#6A7FFF] hover:to-[#2A1CFF] focus:ring-2 focus:outline-none focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5"
                            >
                                Next
                            </button>
                            <button
                                onClick={() => onShowPublish(false)}
                                className="text-gray-700 bg-gray-200 hover:bg-gray-300 focus:ring-2 focus:outline-none focus:ring-gray-400 font-medium rounded-full text-sm px-5 py-2.5"
                            >
                                Cancel
                            </button>

                        </div>

                    </>
                )}

                {step === 2 && (
                    <>
                        <div className='border border-gray-200 rounded-[16px]  p-5 mb-4 bg-white'><h2 className="text-lg font-semibold mb-3 text-[#4318FF]">Course: {courseName}</h2>
                            <p className='text-[#40444D]'>version:0</p>

                        </div>
                        <div className='border border-gray-200 rounded-[16px] p-5 mb-3 bg-white'>
                            <div className="flex items-center mb-3">
                                <input
                                    type="radio"
                                    id="publishOutline"
                                    name="publishOutline"
                                    className="mr-2"
                                    disabled
                                />
                                <h3 className="font-semibold text-[16px] text-[#40444D] mb-0">
                                    Publish as Scorm
                                </h3>
                            </div>
                            <p className='text-[#40444D] text-[12px]'>
                                Export as SCORM package for LMS integration.
                            </p>
                        </div>

                        <div className='border border-gray-200 rounded-[16px] p-5 mb-3 bg-white'>
                            <div className="flex items-center mb-3">
                                <input
                                    type="radio"
                                    id="publishCartridge"
                                    name="publishOutline"
                                    className="mr-2"
                                    onChange={() => setIsetSelectedFormat("cc")}
                                // disabled

                                />
                                <h3 className="font-semibold text-[16px] text-[#40444D] mb-0">
                                    Publish as Cartridge
                                </h3>
                            </div>
                            <p className='text-[#40444D] text-[12px]'>
                                Export as course package for LMS integration.
                            </p>
                        </div>

                        <div className='border border-gray-200 rounded-[16px] p-5 mb-3 bg-white'>
                            <div className="flex items-center mb-3">
                                <input
                                    type="radio"
                                    id="publishOutline"
                                    name="publishOutline"
                                    className="mr-2"
                                    disabled
                                />
                                <h3 className="font-semibold text-[16px] text-[#40444D] mb-0">
                                    Publish as PDF
                                </h3>
                            </div>
                            <p className='text-[#40444D] text-[12px]'>
                                Generate a printable and shareable PDF document.
                            </p>
                        </div>

                        <div className='border border-gray-200 rounded-[16px] p-5 mb-3 bg-white'>
                            <div className="flex items-center mb-3">
                                <input
                                    type="radio"
                                    id="publishOutline"
                                    name="publishOutline"
                                    className="mr-2"
                                    onChange={() => setIsetSelectedFormat("docx")}
                                    defaultChecked
                                />
                                <h3 className="font-semibold text-[16px] text-[#40444D] mb-0">
                                    Publish as DOCX
                                </h3>
                            </div>
                            <p className='text-[#40444D] text-[12px]'>
                                Export as an editable Word document.
                            </p>
                        </div>

                        <div className='border border-gray-200 rounded-[16px] p-5 mb-3 bg-white'>
                            <div className="flex items-center mb-3">
                                <input
                                    type="radio"
                                    id="publishOutline"
                                    name="publishOutline"
                                    className="mr-2"
                                    disabled
                                />
                                <h3 className="font-semibold text-[16px] text-[#40444D] mb-0">
                                    Publish as HTML
                                </h3>
                            </div>
                            <p className='text-[#40444D] text-[12px]'>
                                Publish as a web-friendly, interactive HTML format.
                            </p>
                        </div>

                        <div className='border border-gray-200 rounded-[16px] p-5 mb-3 bg-white'>
                            <div className="flex items-center mb-3">
                                <input
                                    type="radio"
                                    id="publishOutline"
                                    name="publishOutline"
                                    className="mr-2"
                                    disabled
                                />
                                <h3 className="font-semibold text-[16px] text-[#40444D] mb-0">
                                    Publish as TXT
                                </h3>
                            </div>
                            <p className='text-[#40444D] text-[12px]'>
                                Export as a simple plain text file.
                            </p>
                        </div>




                        <div className="flex justify-start mt-4">

                            <button
                                onClick={handlePublish}
                                className="text-white bg-[linear-gradient(135deg,_#868CFF_0%,_#4318FF_100%)] hover:bg-[linear-gradient(135deg,_#6A7FFF_0%,_#2A1CFF_100%)] focus:ring-1 focus:outline-none focus:ring-blue-300 font-medium rounded-full me-3 text-sm px-5 py-2.5 text-center"
                            >
                                Publish
                            </button>
                            <button
                                onClick={() => onShowPublish(false)}
                                className="text-gray-700 bg-gray-200 hover:bg-gray-300 focus:ring-2 focus:outline-none focus:ring-gray-400 font-medium rounded-full text-sm px-5 py-2.5"
                            >
                                Cancel
                            </button>

                        </div>
                    </>
                )}
                {step === 3 && (
                    <>
                        <>
                            <div className='border border-gray-200 rounded-[16px] p-5 bg-white'>
                                <img src={Images.pop_up} alt="Preview" className="w-full h-auto mb-3 rounded" />
                                <div className="text-center">
                                    <h2 className="text-[24px] font-bold mb-3 text-black">
                                        Your course has been successfully published!
                                    </h2>
                                    <p className="text-[#40444D] text-[14px]">
                                        Great job! Your hard work has paid off, and the write course is now published.
                                    </p>
                                </div>

                                <div className="flex flex-col items-center gap-3 mt-4">
                                    <button
                                        onClick={() => navigate('/project-creation/ProjectCards')}
                                        className="text-white bg-gradient-to-r from-[#868CFF] to-[#4318FF] hover:from-[#6A7FFF] hover:to-[#2A1CFF] focus:ring-2 focus:outline-none focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 w-[30%] self-center"
                                    >
                                        Back to projects
                                    </button>
                                    <a
                                        href="#"
                                        onClick={() => onShowPublish(false)}

                                        className="text-blue-600 hover:text-blue-800 font-medium text-xs"
                                    >
                                        Back to home
                                    </a>
                                </div>


                            </div>


                        </>
                    </>
                )}
            </div>
        </div>
    )
}

interface ToastProps {
    message: string;
    onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
    return (
        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-50">
            <div
                className="flex items-center w-full px-4 py-2 text-gray-500 border border-[#05AB0B] rounded-lg shadow-sm bg-[#DBFFEF]"
                role="alert"
            >
                <div className="inline-flex items-center justify-center">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="18" height="18" rx="9" fill="#039855" />
                        <path d="M12.5893 6.17452C12.375 5.93922 12.0536 5.93922 11.8393 6.17452L7.82143 10.5863L6.16071 8.76275C5.94643 8.52746 5.625 8.52746 5.41071 8.76275C5.19643 8.99805 5.19643 9.35099 5.41071 9.58628L7.44643 11.8216C7.55357 11.9392 7.66071 11.998 7.82143 11.998C7.98214 11.998 8.08929 11.9392 8.19643 11.8216L12.5893 6.99805C12.8036 6.76275 12.8036 6.40981 12.5893 6.17452Z" fill="white" />
                    </svg>
                    <div className="ms-3 text-sm text-[#40444D] font-semibold">{message}</div>
                    <button
                        className="ms-12"
                        onClick={onClose}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g clipPath="url(#clip0_3039_11884)">
                                <path d="M18.75 5.25L5.25 18.75" stroke="#4318FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M18.75 18.75L5.25 5.25" stroke="#4318FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </g>
                            <defs>
                                <clipPath id="clip0_3039_11884">
                                    <rect width="24" height="24" fill="white" />
                                </clipPath>
                            </defs>
                        </svg>
                    </button>
                </div>

            </div>
        </div>
    );
};


interface SpinnerProps {
    isLoading: boolean;
}

const Spinner: React.FC<SpinnerProps> = ({ isLoading }) => {
    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div role="status" className="absolute -translate-x-1/2 -translate-y-1/2 top-2/4 left-1/2">
                <svg aria-hidden="true" className="w-16 h-16 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" /><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" /></svg>
                <span className="sr-only">Loading...</span>
            </div>
        </div>
    );
};

interface ISendModal {
    isOpen: boolean;
    courseTitle: string;
    userName: string;
    onClose: () => void;
    onConfirm: () => void;
}

const SendModal: React.FC<ISendModal> = ({ isOpen, courseTitle, userName, onClose, onConfirm }) => {

    if (!isOpen) return null;

    return (
        <div
            id="popup-modal"
            tabIndex={-1}
            className="fixed inset-0 z-50 flex justify-center items-center overflow-y-auto bg-[#000000] bg-opacity-50"
        >
            <div className="relative p-4 bg-white rounded-[30px] shadow text-center w-[30%]">
                <img className="mb-6 w-full" src={Images.send_modal} alt="loading" />
                <h4 className="text-2xl font-bold text-[#393B46] mb-4">
                    Are you sure you want to send the <br /> {courseTitle} <br /> course content to<br /> <span className="text-[#4318FF]">{userName}</span>?
                </h4>
                <p className="text-[12px] mb-8" style={{ lineHeight: "20px" }}>
                    Once submitted, the course content will be locked for <br /> further edits until the review is complete.
                </p>

                <button
                    type="button"
                    className="font-bold rounded-full text-base px-10 py-2.5 text-center bg-[linear-gradient(135deg,_#868CFF_0%,_#4318FF_100%)] text-white hover:bg-[linear-gradient(135deg,_#6A7FFF_0%,_#2A1CFF_100%)] focus:ring-1 focus:ring-blue-300 mr-2"
                    onClick={onConfirm}
                >
                    Confirm
                </button>
                <p className="mt-4"><a className="text-[#4318FF] text-sm" onClick={onClose}>Cancel</a></p>
            </div>
        </div>
    );
};

export default Editor;