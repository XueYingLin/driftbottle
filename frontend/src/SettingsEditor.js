import './SettingsEditor.css'
import './Stamp.css'
import { useEffect, useState, React } from 'react'
import axios from 'axios'
import { useAuth0 } from "@auth0/auth0-react";
import { STAMPS } from './stamps'
import { Stamp } from './Stamp'
import config from './config'

export function SettingsEditor({ visible, showSettings }) {
  const visibilityClass = visible ? "visible" : "hidden"
  const className = `SettingsEditor ${visibilityClass}`
  const [userSettings, setUserSettings] = useState(null)
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    if (isAuthenticated) {
      const fetchData = async () => {
        const accessToken = await getAccessTokenSilently({
          audience: `https://driftbottle.app/api`,
          scope: "read:current_user_settings",
        });

        const result = await axios(`${config.baseUrl}/api/settings`, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        })
        return result.data
      }

      fetchData().then(data => {
        console.log(data)
        setUserSettings(data)
      })
    }
  }, [isAuthenticated, getAccessTokenSilently])

  if (userSettings === null) {
    return <div className={className}><div className="Content">loading..</div></div>
  }

  const saveSettings = async (settings) => {
    const accessToken = await getAccessTokenSilently({
      audience: `https://driftbottle.app/api`,
      scope: "update:current_user_settings",
    });

    await axios.post(`${config.baseUrl}/api/settings`, settings, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
  }

  const validateNickname = (settings) => {
    if (settings.nickname.length < 5) {
      return "Too short, must be at least 5 letters"
    }
    return null
  }

  const handleNicknameChange = (event) => {
    const value = event.target.value
    if (/^[a-zA-Z0-9]*$/.test(value)) {
      let settings = { ...userSettings }
      settings.nickname = value
      setUserSettings(settings)
      saveSettings(settings)
    }
  }

  const setStamp = (stampId) => {
    const settings = { ...userSettings }
    settings.stamp = stampId

    setUserSettings(settings)
    saveSettings(settings)
  }


  return <div className={className}>
    <div className="Content">
      <div>
        <i onClick={() => showSettings(false)} className="fas fa-times-circle CloseIcon"></i>
        <div className="SettingsSection">
          <div>Choose a stamp for your messages</div>
          <div className="StampIcons">
            {STAMPS.map(stamp => {
              const selected = stamp.id === userSettings.stamp
              return <Stamp onClick={() => setStamp(stamp.id)}
                isLarge="true"
                isSelectable="true"
                icon={stamp.icon}
                isSelected={selected} />
            })}
          </div>
        </div>

        <div className="SettingsSection">
          <div>Choose a nickname</div>
          <input onChange={handleNicknameChange} type="text" value={userSettings.nickname}></input>
          <div className="ValidationError" style={{ visibility: validateNickname(userSettings) === null ? "hidden" : "visible" }}>{validateNickname(userSettings)}</div>
        </div>
      </div>
    </div>
  </div>
}