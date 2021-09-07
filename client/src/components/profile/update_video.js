
import React, { useEffect, useState } from "react";
import { Modal } from "react-responsive-modal";
import { FaEdit, } from "react-icons/fa";
import './profile.css'
import { showToast } from '../controls/Toast'
import { showLoading } from '../controls/Loading'
import { UPDATE_VIDEO } from '../../utils/Urls'

const Update_Video = ({ videos, index, updateTitleVideo }) => {
  const [videoInfo, setVideoInfo] = useState({})
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const onChangeForm = (value, stateName) => {
    setVideoInfo({ ...videoInfo, [stateName]: value })
  }
  useEffect(() => {
    setVideoInfo(JSON.parse(JSON.stringify(videos)))
  }, [])
  const updateVideo = async () => {
    showLoading(true)
    try {
      const result = await fetch(UPDATE_VIDEO, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          video_id: videoInfo.id,
          title: videoInfo.title
        })
      })
      if (result.status === 200) {
        showToast('info', "Updated Successfully")
        handleClose()
        updateTitleVideo(index, videoInfo.title)
      } else {
        showToast('info', "Update Failed")
      }
    } catch (e) { console.log(e) }
    showLoading(false)
  }
  return (
    <div>
      <div onClick={handleShow} className="dropdown-item" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', }}>
        <FaEdit style={{ marginRight: 5, }} /> Update
      </div>
      <Modal open={show} center onClose={handleClose}>
        <div style={{ display: 'flex', justifyContent: "center", }}>
          <div style={left_info}>
            <div style={formGroup}>
              <label>Title:</label>
              <input value={videoInfo.title || ""} name="title" onChange={(e) => onChangeForm(e.target.value, 'title')} style={textinput} />
            </div>
            <button onClick={updateVideo} className="btn btn-primary" style={{ width: '100%', marginTop: 15, }}>
              Update
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
export default Update_Video;

const left_info = {
  padding: 20,
  marginRight: 20,
  width: '30vw',
}
const formGroup = {
  display: 'flex',
  flexDirection: 'column',
  fontWeight: "bold",
  width: '100%',
}
const textinput = {
  borderRadius: 5,
  padding: 5,
  width: '100%',
  border: "1px solid #bdc3c7",
}