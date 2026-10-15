// setTimeout 模拟网络请求或探索耗时；Promise 表示尚未完成的异步结果。
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
class TreasureMap {
  static async getInitialClue() {
    await wait(1000);
    return '在古老图书馆发现地图：月光会指引真正的入口。';
  }
  static async decodeAncientScript(clue) {
    await wait(1500);
    if (!clue) throw new Error('没有线索可以解码！');
    return '解码成功！穿过迷雾河，前往古老神庙。';
  }
  static async crossMistRiver() {
    await wait(1600);
    return '你点亮船灯，跟随萤火虫渡河，捡到一枚月光徽章。';
  }
  static async searchTemple(location, forceGuard = false) {
    await wait(1800);
    if (!location) throw new Error('缺少神庙位置！');
    if (forceGuard || Math.random() < 0.5) {
      throw new Error('糟糕！遇到了神庙守卫！');
    }
    return '守卫正在沉睡，你悄悄进入神庙，发现神秘箱子。';
  }
  static async collectKey() {
    await wait(1300);
    return '月光徽章照亮密室，石门开启！获得宝箱钥匙。';
  }
  static async openTreasureBox(key) {
    await wait(1000);
    if (!key) throw new Error('需要钥匙才能打开宝箱！');
    return '恭喜！你找到了星光宝藏，也找回了失落的航海日记！';
  }
}
const $ = id => document.getElementById(id);
const positions = [[10,54],[22,16],[44,37],[63,9],[77,47],[53,71]];
function log(message) {
  const line = document.createElement('p');
  const time = document.createElement('time');
  time.textContent = new Date().toLocaleTimeString('zh-CN',{hour12:false});
  line.append(time, document.createTextNode(message));
  $('log').append(line);
  $('log').scrollTop = $('log').scrollHeight;
  console.log(message);
}
function moveTo(index) {
  const [left, top] = positions[index];
  $('traveler').style.left = `${left}%`;
  $('traveler').style.top = `${top}%`;
  document.querySelectorAll('.place').forEach((place,i) => place.classList.toggle('active', i === index));
  $('status').textContent = '正在探索…';
}
function complete(count) {
  $('bar').style.width = `${count / 6 * 100}%`;
  $('step').textContent = `${count} / 6 个地点`;
}
// 将用户提交答案的事件包装成 Promise，await 会等待答对后再继续。
function answerGuardian() {
  $('riddle').hidden = false;
  $('status').textContent = '等待解谜';
  $('answer').focus();
  return new Promise(resolve => {
    const onSubmit = event => {
      event.preventDefault();
      const answer = $('answer').value.trim();
      if (!['水','清水','water'].includes(answer.toLowerCase())) {
        log('守卫摇摇头：再想想，洗完东西后，什么变脏了？');
        $('answer').select();
        return;
      }
      $('riddle').removeEventListener('submit', onSubmit);
      $('riddle').hidden = true;
      resolve('回答正确！守卫让开道路，并指向月光密室。');
    };
    $('riddle').addEventListener('submit', onSubmit);
  });
}
// 主流程：用 await 按顺序等待每个探索动作完成。
async function findTreasure() {
  $('start').disabled = true;
  $('retry').hidden = true;
  $('guard').disabled = true;
  $('log').replaceChildren();
  $('celebration').hidden = true;
  $('answer').value = '';
  complete(0);
  const forceGuard = $('guard').checked;
  try {
    moveTo(0);
    const clue = await TreasureMap.getInitialClue();
    log(clue); complete(1);
    moveTo(1);
    const location = await TreasureMap.decodeAncientScript(clue);
    log(location); complete(2);
    moveTo(2);
    log(await TreasureMap.crossMistRiver()); complete(3);
    moveTo(3);
    // 局部捕获守卫事件：解谜后继续，避免整场探险直接结束。
    try {
      log(await TreasureMap.searchTemple(location, forceGuard));
    } catch (error) {
      log(error.message);
      log(await answerGuardian());
    }
    complete(4); moveTo(4);
    const key = await TreasureMap.collectKey();
    log(key); complete(5); moveTo(5);
    log(await TreasureMap.openTreasureBox(key));
    complete(6);
    $('status').textContent = '寻宝成功';
    $('celebration').hidden = false;
  } catch (error) {
    log(`任务失败：${error.message}`);
    $('status').textContent = '任务失败';
  } finally {
    // 无论成功还是失败，都恢复按钮状态。
    $('start').disabled = false;
    $('start').hidden = true;
    $('retry').hidden = false;
    $('guard').disabled = false;
  }
}
$('start').addEventListener('click', findTreasure);
$('retry').addEventListener('click', findTreasure);
