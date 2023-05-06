import React,{useMemo,useState,useEffect} from "react";
import axios from 'axios';
import './charts.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';


function Charts(props) {
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
  );

  const [prefectures, setPrefectures] = useState([]);
  const [people,setPeople]=useState([]);
  const [type,setType]=useState(1);

  const url="https://opendata.resas-portal.go.jp";
  const key ='ajdEeR7YE0oVmq9v3ZN35SejRopgea8Rmyu42hxv';
  const Axios=axios.create({
    headers:{
      'X-API-KEY':key
    }
  })

  const [options,setOptions] =useState({
    responsive: true,
    plugins: {
      legend: {
        position: 'top' ,
      },
      title: {
        display: true,
        text: 'Chart.js Line Charstss',
      },
    },
  });
  const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
  const [data,setData] = useState({
    labels,
    datasets: [
    
    ],
  });


  useEffect(() => {
    setChart();
  }, [people]);

  useEffect(() => {
    setChart();
  }, [type])

  const setChart=async e=>{
    var char_list=[];
    var title="";
    if(people.length>0){
      people.forEach(item=>{
        var now_char_list={};
        
        var data_list=null;
        if(type==1){
          data_list=item.sum;
          title="総人口";
        }else if(type==2){
          data_list=item.young;
          title="年少人口";
        }else if(type==3){
          data_list=item.working;
          title="生産年齢人口";
        }else if(type==4){
          data_list=item.old;
          title="老年人口";
        }

        var year_list=[];
        var value_list=[];
        data_list.forEach(data=>{
          year_list.push(data.year);
          value_list.push(data.value);
        })
        now_char_list.year_list=year_list;
        now_char_list.value_list={
          label: item.name,
          data: value_list,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
        };
        char_list.push(now_char_list);
      });
      //console.log(char_list);
  
      setOptions({
        responsive: true,
        plugins: {
          legend: {
            position: 'top' ,
          },
          title: {
            display: true,
            text: title,
          },
        },
      });
      var labels=char_list[0].year_list;
      setData({
        labels:labels,
        datasets:char_list.map(items=>{return items.value_list}),
      });
    }else{
      setData({
        labels:["",""],
        datasets:[],
      });
    }
  }

  const typeChange=async e=>{
    setType(e.target.value);
  }

  const change=async e=>{
    var checked=e.target.checked;
    var name=e.target.id;
    var code=e.target.value;
    console.log(code);
    console.log(name);
    if(checked){
      Axios.get(url+"/api/v1/population/composition/perYear?prefCode="+code)
      .then((data)=>{
        let peopleList=people;
        var result_list=data.data.result.data;
        var now_people={
          id:code,
          name:name
        };
        result_list.forEach(element => {
          if(element.label=="総人口"){
            now_people.sum=element.data;
          }
          if(element.label=="年少人口"){
            now_people.young=element.data;
          }
          if(element.label=="生産年齢人口"){
            now_people.working=element.data;
          }
          if(element.label=="老年人口"){
            now_people.old=element.data;
          }
        });
        peopleList.push(now_people);
        setPeople(peopleList);
        setChart();
      }) 
    }else{
      let people_list=[];
      people.forEach(item=>{
        if(item.id!=code){
          people_list.push(item);
        }
      });
      setPeople(people_list);
    }
  };

  

  useMemo(() => {
    Axios.get(url+"/api/v1/prefectures")
    .then((data)=>{
      setPrefectures(data.data.result);
    }) 
  }, []);   


  return (
    <div> 
      <h1>都道府県別の総人口推移</h1>
      <div className="select_box">
        <select onChange={typeChange}>
          <option value={1}>総人口</option>
          <option value={2}>年少人口</option>
          <option value={3}>生産年齢人口</option>
          <option value={4}>老年人口</option>
        </select>
      </div>
      <div className="prefectures_box">
        {prefectures.map(prefecture=>(
          <p>
            <input type="checkbox" name="cb1" id={prefecture.prefName} value={prefecture.prefCode} onChange={change}/>
            <label for={prefecture.prefName}>{prefecture.prefName}</label>
          </p>
        ))} 
      </div>
      <div>
        <Line data={data} options={options} width="600" height="250" />
      </div>
     
    </div>
  );
} 



export default Charts
