//
// 以下のページで詳細を解説しています
// https://qiita.com/alclimb/items/31d4360c74a8f8935256
//

import * as d3 from 'd3';

// GeoJsonファイルを読み込み
import geoJson from './assets/japan.geo.json';

// load image
//import iconImageUrl from './assets/logo.png';
import watameImageUrl from './assets/marker/hololive/Tsunomaki_Watame_-_Main_Page_Icon.png';
import okayuImageUrl from './assets/marker/hololive/Nekomata_Okayu_-_Main_Page_Icon.png';
import mikoImageUrl from './assets/marker/hololive/Sakura_Miko_-_Main_Page_Icon.png';
import luiImageUrl from './assets/marker/hololive/Takane_Lui_-_Main_Page_Icon.png';
import laplusImageUrl from './assets/marker/hololive/Laplus_Darknesss_-_Main_Page_Icon.png';
import mioImageUrl from './assets/marker/hololive/Ookami_Mio_-_Main_Page_Icon.png';
import kanataImageUrl from './assets/marker/hololive/Amane_Kanata_-_Main_Page_Icon.png';
import matsuriImageUrl from './assets/marker/hololive/Natsuiro_Matsuri_-_Main_Page_Icon.png';
import neneImageUrl from './assets/marker/hololive/Momosuzu_Nene_-_Main_Page_Icon.png';
import shishiroImageUrl from './assets/marker/hololive/Shishiro_Botan_-_Main_Page_Icon.png';
import noelImageUrl from './assets/marker/hololive/Shirogane_Noel_-_Main_Page_Icon.png';
import flareImageUrl from './assets/marker/hololive/Shiranui_Flare_-_Main_Page_Icon.png';
import iroha_ImageUrl from './assets/marker/hololive/Kazama_Iroha_-_Main_Page_Icon.png';

import tamakoImageUrl from './assets/marker/aogiri/CHARACTER_01.png';
import ishikariImageUrl from './assets/marker/aogiri/CHARACTER_03.png';

import uiImageUrl from './assets/marker/other/ShigureUi_icon.webp';

async function main() {
  const width = 900; // 描画サイズ: 幅
  const height = 900; // 描画サイズ: 高さ
  const centerPos = [137.0, 38.2]; // 地図のセンター位置
  const scale = 2500; // 地図のスケール
  const markerSize = [32, 32];
  const markerAlpha = 1.0;
  const labelGroupOffset = [20, 20];

  // 地図の投影設定
  const projection = d3
    .geoMercator()
    .center(centerPos)
    .translate([width / 2, height / 2])
    .scale(scale);

  // 地図をpathに投影(変換)
  const path = d3.geoPath().projection(projection);

  // vtuber data
  var vtuber_data_list = [
    {
      name: 'Tsunomaki Watame',
      geo: 'JP-26',
      marker_path: watameImageUrl
    },
    {
      name: 'Shiranui Flare',
      geo: 'JP-01',
      marker_path: flareImageUrl
    },
    {
      name: 'Nekomata Okayu',
      geo: 'JP-02',
      marker_path: okayuImageUrl
    },
    {
      name: 'Sakura Miko',
      geo: 'JP-03',
      marker_path: mikoImageUrl
    },
    {
      name: 'Takane Lui',
      geo: 'JP-08',
      marker_path: luiImageUrl
    },
    {
      name: 'TaLaplus Darknesss',
      geo: 'JP-09',
      marker_path: laplusImageUrl
    },
    {
      name: 'Ookami Mio',
      geo: 'JP-10',
      marker_path: mioImageUrl
    },
    {
      name: 'Amane Kanata',
      geo: 'JP-11',
      marker_path: kanataImageUrl
    },
    {
      name: 'Kazama Iroha',
      geo: 'JP-19',
      marker_path: iroha_ImageUrl
    },
    {
      name: 'Natsuiro Matsuri',
      geo: 'JP-23',
      marker_path: matsuriImageUrl
    },
    {
      name: 'Momosuzu Nene',
      geo: 'JP-23',
      marker_path: neneImageUrl
    },
    {
      name: 'Shishiro Botan',
      geo: 'JP-27',
      marker_path: shishiroImageUrl
    },
    {
      name: 'Shirogane Noel',
      geo: 'JP-44',
      marker_path: noelImageUrl
    },

    {
      name: 'Akari Ishikari',
      geo: 'JP-01',
      marker_path: ishikariImageUrl
    },
    {
      name: 'Otodama Tamako',
      geo: 'JP-32',
      marker_path: tamakoImageUrl
    },

    {
      name: 'Shigure Ui',
      geo: 'JP-24',
      marker_path: uiImageUrl
    }
  ];

  function flattenPolygon(feat) {
    const polygon_list = [];
    var geom = feat.geometry; 
    if (geom.type === 'MultiPolygon') {
      var props = feat.properties;
      for (var i = 0; i < geom.coordinates.length; ++i) {
        var polygon = {
          'type': 'Polygon', 
          'coordinates': geom.coordinates[i],
          'properties': props
        };
        polygon_list.push(polygon);
      }
    } else if (geom.type === 'Polygon') {
      polygon_list.push(geom);
    }
    for (var i = 0; i < polygon_list.length; ++i) {
      polygon_list[i] = { "type": "Feature", "geometry": polygon_list[i] };
    }
    return polygon_list;
  }

  const geo_to_polygon_list = {}
  geoJson.features
      .filter(feature => feature.geometry)
      .forEach(feature => {
    //console.log(feature.properties.name)
    //console.log(`${feature.properties.iso_3166_2} ${feature.properties.name_ja}`)
    const props = feature.properties;
    const polygon_list = flattenPolygon(feature);
    //polygon_list.forEach(polygon => {
    //  console.log(`${feature.properties.name_ja} ${d3.geoBounds(polygon)}`);
    //});
    geo_to_polygon_list[props.iso_3166_2] = polygon_list;
  });
  function randomIntFromInterval(min, max) { // [min, max)
    return Math.random() * (max - min) + min
  }
  function getRandomLocation(geo) {
    const polygon_list = geo_to_polygon_list[geo];
    const polygon = polygon_list[(Math.floor(Math.random() * polygon_list.length))];
    const bounds = d3.geoBounds(polygon); // [[left, bottom], [right, top]]
    var x, y;
    var chance = 10;
    while (true) {
      x = randomIntFromInterval(bounds[0][0], bounds[1][0]);
      y = randomIntFromInterval(bounds[0][1], bounds[1][1]);
      if (d3.geoContains(polygon, [x, y])) {
        break;
      }
      //console.log(`${inside} ${x} ${y} ${bounds}`);
      --chance;
      if (0 === chance) {
        return d3.geoCentroid(polygon);
      }
    }
    return [x, y];
  }

  // randomize vtuber location
  vtuber_data_list.forEach(vtuber_data => {
    const points = getRandomLocation(vtuber_data.geo)
    vtuber_data['lng'] = points[0];
    vtuber_data['lat'] = points[1];
  });

  // SVG要素を追加
  const svg = d3
    .select(`#map-container`)
    .append(`svg`)
    .attr(`viewBox`, `0 0 ${width} ${height}`)
    .attr(`width`, `100%`)
    .attr(`height`, `100%`);

  //
  // [ メモ ]
  // 動的にGeoJsonファイルを読み込む場合は以下のコードを使用
  // const geoJson = await d3.json(`/japan.geo.json`);
  //

  // 都道府県の領域データをpathで描画
  svg
    .selectAll(`path`)
    .data(geoJson.features)
    .enter()
    .append(`path`)
    .attr(`d`, path)
    .attr(`stroke`, `#666`)
    .attr(`stroke-width`, 0.25)
    .attr(`fill`, `#2566CC`)
    .attr(`fill-opacity`, (item: any) => {
      // メモ
      // item.properties.name_ja に都道府県名が入っている

      // 透明度をランダムに指定する (0.0 - 1.0)
      return Math.random();
    })

    /**
     * 都道府県領域の MouseOver イベントハンドラ
     */
    .on(`mouseover`, function (item: any) {
      // ラベル用のグループ
      const group = svg.append(`g`).attr(`id`, `label-group`);

      // 地図データから都道府県名を取得する
      const label = item.properties.name_ja;

      // 矩形を追加: テキストの枠
      const rectElement = group
        .append(`rect`)
        .attr(`id`, `label-rect`)
        .attr(`stroke`, `#666`)
        .attr(`stroke-width`, 0.5)
        .attr(`fill`, `#fff`);

      // テキストを追加
      const textElement = group
        .append(`text`)
        .attr(`id`, `label-text`)
        .text(label);

      // テキストのサイズから矩形のサイズを調整
      const padding = { x: 5, y: 0 };
      const textSize = textElement.node().getBBox();
      rectElement
        .attr(`x`, textSize.x - padding.x)
        .attr(`y`, textSize.y - padding.y)
        .attr(`width`, textSize.width + padding.x * 2)
        .attr(`height`, textSize.height + padding.y * 2);

      // マウス位置の都道府県領域を赤色に変更
      d3.select(this).attr(`fill`, `#CC4C39`);
      d3.select(this).attr(`stroke-width`, `1`);
    })

    /**
     * 都道府県領域の MouseMove イベントハンドラ
     */
    .on('mousemove', function (item: any) {
      // テキストのサイズ情報を取得
      const textSize = svg.select('#label-text').node().getBBox();

      // マウス位置からラベルの位置を指定
      const labelPos = {
        x: d3.event.offsetX + labelGroupOffset[0],
        y: d3.event.offsetY + labelGroupOffset[1]
      };

      // ラベルの位置を移動
      svg
        .select('#label-group')
        .attr(`transform`, `translate(${labelPos.x}, ${labelPos.y})`);
    })

    /**
     * 都道府県領域の MouseOut イベントハンドラ
     */
    .on(`mouseout`, function (item: any) {
      // ラベルグループを削除
      svg.select('#label-group').remove();

      // マウス位置の都道府県領域を青色に戻す
      d3.select(this).attr(`fill`, `#2566CC`);
      d3.select(this).attr(`stroke-width`, `0.25`);
    })

    // print current location
    .on(`mousedown`, function() {
      console.log(projection.invert(d3.mouse(this)));
    })

    ;

    vtuber_data_list.forEach(vtuber_data => {
      svg.selectAll(".m")
        .data([vtuber_data])
        .enter()
        .append("image")
        .attr("x", function(d,i) {return projection([d.lng, d.lat])[0] - markerSize[0] / 2;})
        .attr("y", function(d,i) {return projection([d.lng, d.lat])[1] - markerSize[1] / 2;})
        .attr('width', markerSize[0])
        .attr('height', markerSize[1])
        .attr("xlink:href", vtuber_data.marker_path)
        .style("opacity", markerAlpha);
    });
    /*svg.selectAll(".m")
      .data(vtuber_data_list)
      .enter()
      .append("image")
      .attr("x", function(d,i) {return projection([d.lng, d.lat])[0] - markerSize[0] / 2;})
      .attr("y", function(d,i) {return projection([d.lng, d.lat])[1] - markerSize[1] / 2;})
      .attr('width', markerSize[0])
      .attr('height', markerSize[1])
      .attr("xlink:href", iconImageUrl)
      .style("opacity", markerAlpha);*/
}

main();
