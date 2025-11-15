const axios = require('axios');



exports.main = async (event, context) => {

    // 获取天气信息（使用中华万年历API）
    const weatherApiUrl = `https://www.tianqi.com/beijing/` /// `http://wthrcdn.etouch.cn/WeatherApi?city=${locationData.city}`;
    let weather = "";
    try {
        // console.log(weatherApiUrl)
        const weatherResponse = await axios.get(weatherApiUrl);

        if (weatherResponse.status === 200) {
            // 解析 HTML 内容
            const htmlContent = weatherResponse.data;
            const wrap1100Regex = /<div class="wrap1100"[^>]*>([\s\S]*?)<\/div>/i;
            const match = htmlContent.match(wrap1100Regex);

            if (match && match[1]) {
                // 删除所有 a 标签及其内容
                let cleanedContent = match[1].replace(/<a[\s\S]*?<\/a>/gi, '');
                cleanedContent = cleanedContent.replace(/<h1[\s\S]*?<\/h1>/gi, ''); // 删除剩余的 a 标签

                cleanedContent = cleanedContent.replace(/dt/gi, 'div');
                cleanedContent = cleanedContent.replace(/dd/gi, 'div');
                cleanedContent = cleanedContent.replace(/dl/gi, 'div');
                cleanedContent = cleanedContent.replace(/<img /gi, '<img style="width:50px;height:50px;"  ');
                cleanedContent = cleanedContent.replace("<br />", ' ');


                // 返回处理后的文本内容
                weather = `<div class="wrap1100">${cleanedContent}</div></div></div></div>`;
            } else {
                weather = null;
                console.error('未找到 class 为 wrap1100 的标签内容');
            }
        } else {
            console.error('获取天气信息失败: 非200响应码', weatherResponse.status);
        }
        // console.log(abs)
    } catch (error) {
        console.error('获取天气信息失败:', error.message);
    }

    // 构造返回结果
    const result = {

        weather,
    };

    return {
        code: 0,
        message: '获取成功',
        data: result
    };
};

`
<div class="wrap1100" >
	<div class="left">
		<dl class="weather_info">
						<dt><img src="https://content.pic.tianqistatic.com/content/img/202112/01/ec35c6eddd287698.jpg" alt="" class="weaone_a"></dt>
						<dd class="name"><h1>北京天气</h1><i><a href="/chinacity.html" title="北京天气预报">[切换城市]</a></i></dd>
		<dd class="week">2025年06月04日　星期三　乙巳年五月初九 芒种</dd>
		<dd class="weather">
			<i><img src="//static.tianqistatic.com/static/wap2018/ico1/b0.png" ></i>
			<p class="now"><b>31</b><i>℃</i></p>
			<span><b>晴</b>22 ~ 34℃</span>
		</dd>
		<dd class="shidu"><b>湿度：21%</b><b>风向：北风 2级</b><b>紫外线：很强</b></dd>
		<dd class="kongqi" ><h5 style="background-color:#79b800;">空气质量：优</h5><h6>PM: 3</h6><span>日出: 04:46<br />日落: 19:38</span></dd>
	    <dl>
	</div>
</div>
`