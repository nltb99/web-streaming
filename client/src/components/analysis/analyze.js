import React, { useState, useEffect } from 'react'
import { GetUserInfo, isLoggedIn, } from '../../store/CredentialController'
import { GetDataStatistics, } from '../../store/AnalyticsController'
import Page404 from '../controls/Page404'
import { showLoading } from '../controls/Loading'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'

const Analyze = ({ }) => {
    const [loading, setLoading] = useState(true)
    const [userInfo, setUserInfo] = useState({})
    const [loggedIn, setLoggedIn] = useState(false)
    const [selectedStat, setSelectedStat] = useState(0)
    const [currentDataStat, setCurrentDataStat] = useState([])
    const [stat_trans_token, setDataTransToken] = useState({})
    const [stat_trans_banking, setDataTransBanking] = useState({})
    const [stat_likes, setStatLikes] = useState([])
    const [stat_viewers, setStatViewers] = useState([])
    const [stat_subscriptions, setStatSubscriptions] = useState([])
    const [stat_receive_tokens, setReceiveTokens] = useState([])
    const [stat_buy_tokens, setBuyTokens] = useState([])
    const [mutate, setMutate] = useState(false)

    const tokenPieChart = {
        chart: { type: 'pie' },
        title: { text: 'Transaction Token' },
        subtitle: { text: `Total: ${stat_trans_token.total_sum || 0} tokens` },
        accessibility: {
            announceNewData: { enabled: true },
            point: { valueSuffix: '%' }
        },
        plotOptions: {
            series: { dataLabels: { enabled: true, format: '{point.name}: {point.y:.1f}%' } }
        },
        tooltip: {
            headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
            pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}%</b> of total<br/>'
        },
        series: [
            {
                name: "Browsers",
                colorByPoint: true,
                data: [
                    { name: "Sent", y: stat_trans_token.sent_token, },
                    { name: "Received", y: stat_trans_token.received_token, },
                ]
            }
        ],
    }
    const bankingPieChart = {
        chart: { type: 'pie' },
        title: { text: 'Transaction Banking' },
        subtitle: { text: `Total: ${stat_trans_banking.deposit || 0}$` },
        accessibility: {
            announceNewData: { enabled: true },
            point: { valueSuffix: '%' }
        },
        plotOptions: {
            series: {
                dataLabels: { enabled: true, format: '{point.name}: {point.y:.1f}$' }
            }
        },
        tooltip: {
            headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
            pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}%</b> of total<br/>'
        },
        series: [
            {
                name: "Browsers",
                colorByPoint: true,
                data: [
                    {
                        name: "Deposit",
                        y: stat_trans_banking?.deposit,
                    },
                    {
                        name: "Withdrawal",
                        y: 0,
                    },
                ]
            }
        ],
    }
    const lineChart = {
        chart: { type: 'column' },
        title: { text: 'Weekly' },
        subtitle: { text: '' },
        accessibility: { announceNewData: { enabled: true } },
        xAxis: { type: 'category' },
        yAxis: { title: { text: 'Quantity' } },
        legend: { enabled: false },
        plotOptions: {
            series: {
                borderWidth: 0,
                dataLabels: {
                    enabled: true,
                    // format: '{point.y:.1f}%'
                }
            },
        },
        series: [{ name: "Point", colorByPoint: true, data: currentDataStat, }],
    }
    const onChangeStatTabs = async (index) => {
        await setMutate(true)
        let data = []
        switch (index) {
            case 0:
                data = stat_likes || []
                break;
            case 1:
                data = stat_viewers || []
                break;
            case 2:
                data = stat_subscriptions || []
                break;
            case 3:
                data = stat_receive_tokens || []
                break;
            case 4:
                data = stat_buy_tokens || []
                break;
        }
        setCurrentDataStat(data)
        setSelectedStat(index)
        await setMutate(false)
    }
    const callEffect = async () => {
        try {
            showLoading(true)
            setLoading(true)
            if (await isLoggedIn()) {
                const userInfo = await GetUserInfo()
                const dataTransaction = await GetDataStatistics({ user_id: userInfo.id }) || {}
                setDataTransBanking(dataTransaction?.data?.stat_trans_banking || {})
                setDataTransToken(dataTransaction?.data?.stat_trans_token || {})
                setStatLikes(dataTransaction?.data?.stat_likes || [])
                setStatViewers(dataTransaction?.data?.stat_viewers || [])
                setStatSubscriptions(dataTransaction?.data?.stat_subscriptions || [])
                setReceiveTokens(dataTransaction?.data?.stat_receive_tokens || [])
                setBuyTokens(dataTransaction?.data?.stat_buy_tokens || [])
                setCurrentDataStat(dataTransaction?.data?.stat_likes || [])
                setLoggedIn(true)
            }
            showLoading(false)
            setLoading(false)
        } catch (e) { console.log(e) }
    }
    useEffect(() => {
        callEffect()
    }, []);
    return (
        <React.Fragment>
            {!loggedIn && !loading ? (
                <Page404 text="Login Required" />
            ) : (!loading) ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'auto', width: '90%', margin: 'auto', marginTop: 20, }}>
                    <h1 className="text_primary" style={{ textAlign: 'center', }}>Analytics</h1>
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', }}>
                        <div className="btn-group">
                            <button onClick={() => onChangeStatTabs(0)} className={`btn btn-${selectedStat === 0 ? "primary" : "secondary"}`}>Likes</button>
                            <button onClick={() => onChangeStatTabs(1)} className={`btn btn-${selectedStat === 1 ? "primary" : "secondary"}`}>Viewers</button>
                            <button onClick={() => onChangeStatTabs(2)} className={`btn btn-${selectedStat === 2 ? "primary" : "secondary"}`}>Subscriptions</button>
                            <button onClick={() => onChangeStatTabs(3)} className={`btn btn-${selectedStat === 3 ? "primary" : "secondary"}`}>Received Tokens</button>
                            <button onClick={() => onChangeStatTabs(4)} className={`btn btn-${selectedStat === 4 ? "primary" : "secondary"}`}>Buy Tokens</button>
                        </div>
                        {!mutate && (
                            <HighchartsReact highcharts={Highcharts} options={lineChart} />
                        )}
                    </div>
                    <hr />
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%', }}>
                        <div style={{ width: '50%', }}>
                            <HighchartsReact highcharts={Highcharts} options={bankingPieChart} />
                        </div>
                        <div style={{ width: '50%', }}>
                            <HighchartsReact highcharts={Highcharts} options={tokenPieChart} />
                        </div>
                    </div>
                </div>
            ) : !loading && (
                <Page404 text={"No User Found"} />
            )}
        </React.Fragment>
    )
}

export default Analyze;
