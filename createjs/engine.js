//----------------------------------------------------------------------------------------------------
//	Gobal var
//----------------------------------------------------------------------------------------------------


//----------------------------------------------------------------------------------------------------
//	class name.
//----------------------------------------------------------------------------------------------------
window.Engine = (function() {

//----------------------------------------------------------------------------------------------------
//	namespace.
//----------------------------------------------------------------------------------------------------
function Engine() {}	
	
//*Do not remove
var mExtendedClass = null;
var mExtendClass = null;
//*Write your class name here,	and use mSignalDivert for target such as dispatch/player/..
var mSignalDivert = Engine;		//this will Change if it's extend by another class
var mThisClass = Engine;		//fix class, wont change, for extend use

//*Note special private var key, can inherit from extend but not shared,
//	special var not just inherit var only, it can be used to inherit functions too.
//	example ClassB special var has a function, Engine will be able to use that function 
//		without re-writting it, just by calling mThisVar.(function name)
var mThisVar = {};
var mGrouping = {};
var xKeyID = ["Hundredths", "Tenths", "Ones", "Tens"];
var xKeyID2 = ["Tens", "Ones", "Tenths", "Hundredths"];
//----------------------------------------------------------------------------------------------------
//	Start of class - involve by module or extend
//----------------------------------------------------------------------------------------------------
Engine.fModuleLoaded = function(
	vId
)
{			
	//----------------------------------------------------------
	//extend function, do not move. If not using, Comment off
	//	(class name to extend (string), this vId)
	// 	user gobal var if sharing among the classes is required
	//----------------------------------------------------------
	
	//keep record of the id of this module, so that do not required hard coding 
	//	example mScene[mThisVar.id] rather than mScene["DemoLib"]
	mThisVar.id = vId;

	//Start doing class stuff, *calling a function here just to separate
	cEngine();
}

function
cEngine(
) 
{
	
}

//------------------------------------------------------------------------------------------------- 
//handle signal. //todo. return true to bubble signal to parent, false (default) to stop.
//-------------------------------------------------------------------------------------------------
Engine.fStart = function()
{
	fInitActivity();
}

//------------------------------------------------------------------------------------------------- 
// Called by UI.js
//-------------------------------------------------------------------------------------------------
function
fInitActivity()
{
	
	fDbg("fInitActivity");		
	mScene["Grouping"].mcClone.visible = false;
	mGrouping.mNewCubeList = [];
	mGrouping.mSelectedCubeList = [];
	mGrouping.mMaxCubeList = [];
	mGrouping.mStatusList = [];
	mGrouping.vList = [];

	for(i =0 ; i< mScene["Grouping"].numChildren; i++)
	{
		if(mScene["Grouping"].getChildAt(i).prefix == "mcPanel")
			mGrouping.vList.push(mScene["Grouping"].getChildAt(i));
		else if(mScene["Grouping"].getChildAt(i).prefix == "tfNum" || mScene["Grouping"].getChildAt(i).prefix == "tfSelect")
		{
			if(mScene["Grouping"].getChildAt(i).suffix.search("Remain") != -1)			
				mScene["Grouping"].getChildAt(i).visible = false;			
			else if(mScene["Grouping"].getChildAt(i).suffix.search("2") != -1)
			{
				//display usage
				mScene["Grouping"].getChildAt(i).text = "";
			}
			else
			{
				mScene["Grouping"].getChildAt(i).SetInputRange(["num"]);
				mScene["Grouping"].getChildAt(i).ShowKeyboard = "num";
				mScene["Grouping"].getChildAt(i).text = "00"; //just increasing the box size
				mScene["Grouping"].getChildAt(i).BGcolor = "rgba(0, 0, 0, 0.1)";
				mScene["Grouping"].getChildAt(i).SetInput(true);			
				mScene["Grouping"].getChildAt(i).MaxChar = 1;
				mScene["Grouping"].getChildAt(i).text = "";
			}
		}
	}
	
	for (i = 0; i < mGrouping.vList.length; i++)
	{
		mGrouping.mNewCubeList[mGrouping.vList[i].suffix] = [];
		mGrouping.mSelectedCubeList[mGrouping.vList[i].suffix] = [];
		mGrouping.mMaxCubeList[mGrouping.vList[i].suffix] = 9;
		mGrouping.mStatusList[mGrouping.vList[i].suffix] = {vCalculated: false, vGrouped: false };
	}
	mGrouping.mStatusList[fGetNewKey(fGetInitKey(), "Break")] = { vCalculated: true, vGrouped: true };
	mGrouping.mIsChipVersion = (mScene["Grouping"].mcChips != undefined)?true:false;
	fReset();
}

//-------------------------------------------------------------------------------------------------
//*DO NOT REMOVE
//	fExtend, use to extend another class and setup the calling
//-------------------------------------------------------------------------------------------------
function
fExtend(
	vClass,
	vId
)
{
	var o;
	var key;
	
	o = window[vClass].fExtend(mExtendClass ? mExtendClass : mThisClass, vId);
	
	mExtendedClass = o[0];
	
	for(key in o[1])
	{
		//*Rename this if you Change the "special private var key"
		mThisVar[key] = o[1][key];			
	}
}

//-------------------------------------------------------------------------------------------------
//*DO NOT REMOVE
//	Engine.fExtend, for primary class able to call and extends this class
//-------------------------------------------------------------------------------------------------
Engine.fExtend = function(
	vParentClass,
	vId
)
{
	//*Rename this if you Change the "special private var key"
	mThisVar.id = vId;
	mExtendClass = vParentClass;	
	mSignalDivert = vParentClass;
	mThisClass.fModuleLoaded(vId);
	
	//*Rename this if you Change the "special private var key"
	return [this, mThisVar];
}

//-------------------------------------------------------------------------------------------------
//*DO NOT REMOVE
//internal pState
//	this decides if the pState is passing to parent class or for itself
//------------------------------------------------------------------------------------------------- 
function 
pState(
	vData
)
{
	if((vData == null) || (vData == undefined))
		return mLastpState;
	
	if(mExtendClass != null)
		mExtendClass.pForwardState(vData);
	else	
		mThisClass.pState(vData);	
}

//------------------------------------------------------------------------------------------------- 
//*DO NOT REMOVE
//	call from extend class, passing to self pState to handle
//------------------------------------------------------------------------------------------------- 
Engine.pForwardState = function(
	vData
)
{
	pState(vData);
}

//------------------------------------------------------------------------------------------------- 
//*DO NOT REMOVE
//external pState
//	this pState allows outside/extend class to reach
//------------------------------------------------------------------------------------------------- 
Engine.pState = function(
	vData
)
{
	fDbg("Engine pState - " + vData);
	
	//*DO NOT REMOVE (for passing to extend class)
	mLastpState = vData;
	
	switch(vData)
	{
		
	}
	
	//*DO NOT REMOVE (for passing to extend class)
	if(mExtendedClass != null)
		mExtendedClass.pState(vData);
}

//------------------------------------------------------------------------------------------------- 
//*DO NOT REMOVE
//handle signal
//-------------------------------------------------------------------------------------------------
Engine.fOnSignal = function(
	vTarget, 				//	original target for signal
	vSignal, 				//	signal received
	vData					//	extra data along with signal
)
{
	fDbg("Engine.fOnSignal = " + vTarget + " , " + vSignal + " , " + vData);
	
	var i;
	var j;
	var vObj;
	var o;
	var p; 
	var q;
	var vKey;
	
	switch (vSignal)
	{		
		case "Signal_Zoom":
			break;
		
		case "Signal_Reset":			
			fReset();
			break;
			
		case Signal_MouseDown:			
			break;
			
		case Signal_MouseUp:			
			break;	
			
		case Signal_MouseMove:
			break;
			
		case Signal_Drag:			
			break;
			
		case Signal_Change:
			i = parseInt(vTarget.text);
			
			switch (vTarget.prefix)
			{
				case "tfNum":		
					if(isNaN(i))
						i = 0;
					
					fClearSelection();
					fAddModel(vTarget.suffix, i);
					fUpdateSelectedNum();
					break;
			}
			break;
			
		case Signal_Click:	
			switch (vTarget.name)
			{				
				case "pbPDF":
					var urlChunks = location.pathname.split('/');
					urlChunks = urlChunks[urlChunks.length - 2];
					window.open(urlChunks + "_WS.pdf");
					break;	
					
				case "pbTrash":
					for (vKey in mGrouping.mSelectedCubeList)
					{
						for (i = 0; i < mGrouping.mSelectedCubeList[vKey].length; i++)
						{
							j = mGrouping.mNewCubeList[vKey].indexOf(mGrouping.mSelectedCubeList[vKey][i]);
							if (j != -1)
								mGrouping.mNewCubeList[vKey].splice(j, 1);
							mScene["Grouping"].removeChild(mGrouping.mSelectedCubeList[vKey][i]);
						}
						
						mGrouping.mSelectedCubeList[vKey] = [];
						
						for (i = 0; i < mGrouping.mNewCubeList[vKey].length; i++)
							mGrouping.mNewCubeList[vKey][i].name = "mcNewModel_" + vKey + "_" + i;							

						fRearrangeCube(vKey, mGrouping.mNewCubeList[vKey].length);
		
						if (mScene["Grouping"]["pbGroup_" + vKey] != undefined && mGrouping.mStatusList[vKey].vCalculated)
							mGrouping.mStatusList[vKey].vGrouped = (mGrouping.mNewCubeList[vKey].length < 10);
					}		
					fUpdateSelectedNum();
					break;
					
				case "pbReset":
					fReset();
					break;					
			}
			
			switch (vTarget.prefix)
			{
				case "hsModel":					
					fClearSelection();
					fAddModel(vTarget.suffix, mGrouping.mNewCubeList[vTarget.suffix].length + 1);
					fUpdateSelectedNum();
					break;
				
				case "cbModel":
					vKey = vTarget.suffix;
					i = mGrouping.mNewCubeList[vKey].indexOf(vTarget.parent);
					
					if(i == -1)
					{
						vKey = String(vKey).split("1")[0];
						i = mGrouping.mNewCubeList[vKey].indexOf(vTarget.parent);
					}
					fSetSelection(vKey, vTarget.Selected ? i : i + 1, 10);
					fUpdateSelectedNum();	
					break;
					
				case "pbMove":
					vTarget.visible = false;
					fShiftTensToHundred();
					break;	
					
				case "pbAdd":	
					if(mGrouping.First)
					{
						mGrouping.First = false;
						fFillRemoveZeros();
					}
					
					mScene["Grouping"]["mcDivider_" + vTarget.suffix].visible = false;
					fDisableInput(false);
					mThisVar.ClickedAdd = true;
					mThisVar.ClickedTarget = String(vTarget.suffix).split("1")[0];
					
					fClearSelection();
					fUpdateSelectedNum();	
					vTarget.visible = false;
					vTarget.fEnable(false);
					fAddGroup(vTarget.suffix);
					
					if(mScene["Grouping"]["tfNum_"+mThisVar.ClickedTarget+"2"] != undefined)	
					{
						if(((mScene["Grouping"]["tfNum_"+mThisVar.ClickedTarget].text == "") && (mScene["Grouping"]["tfNum_"+mThisVar.ClickedTarget+"1"].text == "")) && (mGrouping.mNewCubeList[mThisVar.ClickedTarget].length == 0))
							;
						else
							mScene["Grouping"]["tfNum_"+mThisVar.ClickedTarget+"2"].fText(mGrouping.mNewCubeList[mThisVar.ClickedTarget].length);
					}
				
					if(vTarget.suffix == "Ones1")											
						mScene["Grouping"]["mcDecimal"].visible = true;
					
					if(vTarget.suffix == "Tens1")		
					{
						//mScene["Grouping"]["mcInstruction"].fStop(4);	
						mGrouping.isfinal = true;
					}
					break;
						
				case "pbGroup":
					fClearSelection();
					vTarget.visible = false;
					vTarget.fEnable(false);
					fGroupSelection(vTarget.suffix, fGetNewKey(vTarget.suffix, "Group"));
					
					if(vTarget.suffix == "Tenths")											
						mScene["Grouping"]["mcDecimal"].visible = true;					
					
					if(mScene["Grouping"]["tfNum_"+mThisVar.ClickedTarget+"2"] != undefined)
						mScene["Grouping"]["tfNum_"+mThisVar.ClickedTarget+"2"].fText(mGrouping.mNewCubeList[mThisVar.ClickedTarget].length);
					
					fUpdateSelectedNum();
					break;
			}
			break;		
	}
	
	//*DO NOT REMOVE (for passing to extend class)
	if(mExtendedClass != null)
	{
		fDbg("mExtendedClass " + vSignal);
		mExtendedClass.fOnSignal(vTarget, vSignal, vData);
	}	
	return false;
}


//----------------------------------------------- 
// own function
//----------------------------------------------- 

function
fGetNewKey(
	vKey,
	vType
)
{
	var vKeyList= [];
	var vIdx;
	
	vKeyList = ["HundredThousandths", "TenThousandths", "Thousandths", "Hundredths", "Tenths", "Ones", "Tens", "Hundreds", "Thousands", "TenThousands", "HundredThousands", "Millions", "TenMillions"];
	vIdx = vKeyList.indexOf(vKey);

	vIdx = vIdx + ((vType == "Group") ? 1 : -1);
	return vKeyList[vIdx];
}

function
fGetInitKey(
) 
{
	var vKeyList= [];
	var i;
	var j;
	
	vKeyList = ["HundredThousandths", "TenThousandths", "Thousandths", "Hundredths", "Tenths", "Ones", "Tens", "Hundreds", "Thousands", "TenThousands", "HundredThousands", "Millions", "TenMillions"];
	
	for (i = 0; i < vKeyList.length; i++)
		if(mScene["Grouping"]["mcPanel_"+vKeyList[i]] != undefined)
			break;
		
	return vKeyList[i];
}

//----------------------------------------------------------------------------------------------------
//	release all group
//----------------------------------------------------------------------------------------------------
function
fReset(
)
{	
	var i;
	var vKey;
	
	if(mGrouping.SingleHundred != null)	
		mScene["Grouping"].removeChild(mGrouping.SingleHundred);
	
	mThisVar.ClickedAdd = false;
	mThisVar.ClickedTarget = "";
	mGrouping.First = true;
	mGrouping.isfinal = false;
	mGrouping.Ended = false;
	
	mGrouping.SingleHundred = null;	
	
	//to stop all animation and destory all Object that animating
	cTransit.fEndTransit();
	if(mGrouping.mGroupN !=undefined)
		fResetAnimation(mGrouping.mPanel, mGrouping.mGroupN);

	fClearSelection();
	fDisableInput(true);
	
	mScene["Grouping"]["mcDisplay_Hundreds"].visible = false;
	mScene["Grouping"]["pbMove_Hundreds"].visible = false;	
	
	mScene["Grouping"]["mcDecimal"].visible = false;
	
	mScene["Grouping"]["tfNum_Ones"].text = "";
	mScene["Grouping"]["tfNum_Tenths"].text = "";
	mScene["Grouping"]["tfNum_Hundredths"].text = "";
	mScene["Grouping"]["tfNum_Tens"].text = "";
	
	mScene["Grouping"]["tfNum_Ones1"].text = "";
	mScene["Grouping"]["tfNum_Tenths1"].text = "";
	mScene["Grouping"]["tfNum_Hundredths1"].text = "";
	mScene["Grouping"]["tfNum_Tens1"].text = "";
	
	mScene["Grouping"]["tfNum_Ones2"].text = "";
	mScene["Grouping"]["tfNum_Tenths2"].text = "";
	mScene["Grouping"]["tfNum_Hundredths2"].text = "";
	mScene["Grouping"]["tfNum_Tens2"].text = "";
	mScene["Grouping"]["tfNum_Hundreds2"].text = "";
	
	mScene["Grouping"]["tfNum_TenthsRemain"].visible = false;	
	mScene["Grouping"]["tfNum_OnesRemain"].visible = false;	
	mScene["Grouping"]["tfNum_TensRemain"].visible = false;	
	
	mScene["Grouping"]["mcDivider_Tens1"].visible = true;
	mScene["Grouping"]["mcDivider_Ones1"].visible = true;
	mScene["Grouping"]["mcDivider_Tenths1"].visible = true;
	mScene["Grouping"]["mcDivider_Hundredths1"].visible = true;
	
	mScene["Grouping"]["pbAdd_Tens1"].visible = true;
	mScene["Grouping"]["pbAdd_Ones1"].visible = true;
	mScene["Grouping"]["pbAdd_Tenths1"].visible = true;
	mScene["Grouping"]["pbAdd_Hundredths1"].visible = true;
			
	mScene["Grouping"]["pbGroup_Ones"].visible = true;
	mScene["Grouping"]["pbGroup_Tenths"].visible = true;
	mScene["Grouping"]["pbGroup_Hundredths"].visible = true;

	for (vKey in mGrouping.mNewCubeList)
	{
		for (i = 0; i < mGrouping.mNewCubeList[vKey].length; i++)
		{
			mScene["Grouping"].removeChild(mGrouping.mNewCubeList[vKey][i]);
		}
		mGrouping.mNewCubeList[vKey] = [];
		mGrouping.mStatusList[vKey] = {vCalculated: false, vGrouped: false };
	}
		
	mGrouping.mRegrouped = false;
	fUpdateSelectedNum();

	mScene["Grouping"]["mcInstruction"].fStop(1);
	mScene["Grouping"]["pbAdd_Hundredths1"].fEnable(false);
}
//----------------------------------------------------------------------------------------------------
//	update all selected model kinds count, display in the textfield
//----------------------------------------------------------------------------------------------------
function
fUpdateSelectedNum(
) 
{
	var Num;
	var Num1;
	var i;
	var vList;
	var vNewKey;
	var vKey;
	
	Num = Num1 = 0;
	
	for (vKey in mGrouping.mNewCubeList)
	{
		switch (vKey)
		{
		case "Hundredths": 
			Num = Num + mGrouping.mNewCubeList[vKey].length * 0.01;
			break;
		case "Tenths": 
			Num = Num + mGrouping.mNewCubeList[vKey].length * 0.1;
			break;
		case "Ones": 
			Num = Num + mGrouping.mNewCubeList[vKey].length;
			break;
		case "Tens": 
			Num = Num + mGrouping.mNewCubeList[vKey].length * 10;
			break;
		case "Hundreds": 
			Num = Num + mGrouping.mNewCubeList[vKey].length * 100;
			break;
		case "Thousands": 
			Num = Num + mGrouping.mNewCubeList[vKey].length * 1000;
			break;
		case "TenThousands": 
			Num = Num + mGrouping.mNewCubeList[vKey].length * 10000;
			break;
		case "Hundredths1": 
			Num1 = Num1 + mGrouping.mNewCubeList[vKey].length * 0.01;
			break;
		case "Tenths1": 
			Num1 = Num1 + mGrouping.mNewCubeList[vKey].length * 0.1;
			break;
		case "Ones1": 
			Num1 = Num1 + mGrouping.mNewCubeList[vKey].length;
			break;
		case "Tens1": 
			Num1 = Num1 + mGrouping.mNewCubeList[vKey].length * 10;
			break;
		case "Hundreds1": 
			Num1 = Num1 + mGrouping.mNewCubeList[vKey].length * 100;
			break;
		case "Thousands1": 
			Num1 = Num1 + mGrouping.mNewCubeList[vKey].length * 1000;
			break;
		case "TenThousands1": 
			Num1 = Num1 + mGrouping.mNewCubeList[vKey].length * 10000;
			break;
		}

		if(!mThisVar.ClickedAdd)
		{
			if(!fValueMoreThanZero())
				mScene["Grouping"]["mcInstruction"].fStop(1);
				
			if(mScene["Grouping"]["tfNum_"+vKey] != undefined)
			{
				mScene["Grouping"]["tfNum_"+vKey].text = (mScene["Grouping"]["tfNum_"+vKey].text == "0" ? "0" : (mGrouping.mNewCubeList[vKey].length == 0 ? "" : mGrouping.mNewCubeList[vKey].length));
				mScene["Grouping"]["tfNum_"+vKey].fEnable(!mGrouping.mRegrouped);
			}
		}

		if(mScene["Grouping"]["pbAdd_"+vKey] != undefined)
		{
			vNewKey = vKey.substr(0, vKey.indexOf("1"));
			
			if((vKey == "Hundredths1") && (fValueMoreThanZero()))		
			{
				mScene["Grouping"]["pbAdd_"+vKey].fEnable(!mGrouping.mStatusList[vKey].vCalculated && mGrouping.mStatusList[fGetNewKey(vNewKey, "Break")].vGrouped);
			}
			else if(vKey == "Hundredths1")
			{
				mScene["Grouping"]["pbAdd_"+vKey].fEnable(false);			
			}
			else
			{
				mScene["Grouping"]["pbAdd_"+vKey].fEnable(!mGrouping.mStatusList[vKey].vCalculated && mGrouping.mStatusList[fGetNewKey(vNewKey, "Break")].vGrouped);
			}
		}

		if(mScene["Grouping"]["pbGroup_"+vKey] != undefined)
		{			
			mScene["Grouping"]["pbGroup_"+vKey].fEnable( mGrouping.mStatusList[vKey].vCalculated && (mGrouping.mNewCubeList[vKey].length > 9));
			mScene["Grouping"]["pbGroup_"+vKey].visible = ( mGrouping.mStatusList[vKey].vCalculated && (mGrouping.mNewCubeList[vKey].length > 9));

			if(vKey == mThisVar.ClickedTarget)
			{
				mScene["Grouping"]["mcInstruction"].fStop(mScene["Grouping"]["pbGroup_"+vKey].Enabled ? 3 : 2);
			}
			else if(mThisVar.ClickedTarget == "") 	
			{
				if(fValueMoreThanZero() == false)
				{
					mScene["Grouping"]["mcInstruction"].fStop(1);
				}
				else
				{
					mScene["Grouping"]["mcInstruction"].fStop(2);
				}
			}
		}

		if(mScene["Grouping"]["pbBreak_"+vKey] != undefined)
			mScene["Grouping"]["pbBreak_"+vKey].fEnable((mGrouping.mNewCubeList[vKey].length > 0 && mGrouping.mNewCubeList[fGetNewKey(vKey, "Break")].length < 10));
			
		if(mScene["Grouping"]["hsModel_"+vKey] != undefined)
			mScene["Grouping"]["hsModel_"+vKey].fEnable(!mGrouping.mRegrouped && (mGrouping.mMaxCubeList[vKey] == 0 || mGrouping.mNewCubeList[vKey].length < mGrouping.mMaxCubeList[vKey]));
	}

	if(mScene["Grouping"].tfWarning != undefined)
		mScene["Grouping"].tfWarning.visible = false;

	if(mScene["Grouping"].tfTotal != undefined)
		mScene["Grouping"].tfTotal.text = Num;

	if(mScene["Grouping"].tfTotal1 != undefined)
		mScene["Grouping"].tfTotal1.text = Num1;

	if(mGrouping.mNewCubeList["Hundreds"] !=undefined)
	for(i=mGrouping.mNewCubeList["Hundreds"].length-1; i>-1; i--)
	{
		mScene["Grouping"].removeChild(mGrouping.mNewCubeList["Hundreds"][i]);
		mScene["Grouping"].addChild(mGrouping.mNewCubeList["Hundreds"][i]);
	}	
	if(mGrouping.mNewCubeList["Hundreds1"] !=undefined)
	for(i=mGrouping.mNewCubeList["Hundreds1"].length-1; i>-1; i--)
	{
		mScene["Grouping"].removeChild(mGrouping.mNewCubeList["Hundreds1"][i]);
		mScene["Grouping"].addChild(mGrouping.mNewCubeList["Hundreds1"][i]);
	}	
	if(mGrouping.mNewCubeList["Thousands"] !=undefined)
	for(i=mGrouping.mNewCubeList["Thousands"].length-1; i>-1; i--)
	{
		mScene["Grouping"].removeChild(mGrouping.mNewCubeList["Thousands"][i]);
		mScene["Grouping"].addChild(mGrouping.mNewCubeList["Thousands"][i]);
	}
	if(mGrouping.mNewCubeList["Thousands1"] !=undefined)
	for(i=mGrouping.mNewCubeList["Thousands1"].length-1; i>-1; i--)
	{
		mScene["Grouping"].removeChild(mGrouping.mNewCubeList["Thousands1"][i]);
		mScene["Grouping"].addChild(mGrouping.mNewCubeList["Thousands1"][i]);
	}
}
//----------------------------------------------------------------------------------------------------
//	release all group
//----------------------------------------------------------------------------------------------------
function
fClearSelection(
) 
{	
	var i;
	var j;
	var vKey;
	var vList;
		
	for (vKey in mGrouping.mSelectedCubeList)
	{
		for (i = 0; i < mGrouping.mSelectedCubeList[vKey].length; i++)
		{
			vList =[];
			for(k=0;k <mGrouping.mSelectedCubeList[vKey][i].numChildren;k++)
				if(mGrouping.mSelectedCubeList[vKey][i].getChildAt(k).prefix == "cbModel")
					vList.push(mGrouping.mSelectedCubeList[vKey][i].getChildAt(k));
		
			for (j = 0; j < vList.length; j++)
				vList[j].fSelect(false);
		}
		mGrouping.mSelectedCubeList[vKey] = [];
	}
	
	vList= [];
	for(i=0; i< mScene["Grouping"].numChildren;i++)
		if(mScene["Grouping"].getChildAt(i).prefix == "mcPanel")
			vList.push(mScene["Grouping"].getChildAt(i));
	for (i = 0; i < vList.length; i++)
	{
		if(vList[i].totalFrames>1)
		vList[i].gotoAndStop(0);
	}	
}
//----------------------------------------------------------------------------------------------------
//	update all selected model kinds count, display in the textfield
//----------------------------------------------------------------------------------------------------
function
fAddModel(
	vKey,
	vLen
)
{
	var vIndicator;
	var vList;
	var i;
	var p;
	
	vList = [];
	vLen = Math.min(vLen, mGrouping.mMaxCubeList[vKey]);
	
	while (mGrouping.mNewCubeList[vKey].length < vLen)
	{
		p = fCloneDone(1,vKey);
		
		for (i = 0; i < p.length; i++)
		{
			p[i].visible = true;
			p[i].name = "mcNewModel_" + vKey + "_" + mGrouping.mNewCubeList[vKey].length;
		
			mScene["Grouping"].addChild(p[i]);
			mGrouping.mNewCubeList[vKey].push(p[i]);
		}
	}
	for (i = vLen; i < mGrouping.mNewCubeList[vKey].length; i++)
		mScene["Grouping"].removeChild(mGrouping.mNewCubeList[vKey][i]);

	mGrouping.mNewCubeList[vKey].splice(vLen);
	fRearrangeCube(vKey, mGrouping.mNewCubeList[vKey].length);
}

function
fRearrangeCube(
	vKey,
	vLen
) 
{
	var vList;
	var i;
	var vObj;
	
	for (i = 0; i < mGrouping.mNewCubeList[vKey].length; i++)
	{
		vObj = fGetNewPosAt(vKey, vLen, mGrouping.mNewCubeList[vKey][i], i);
		
		mGrouping.mNewCubeList[vKey][i].x = vObj.x;
		mGrouping.mNewCubeList[vKey][i].y = vObj.y;
	}	
}

function
fGetNewPosAt(
	vKey,
	vTotal,
	vIndicator,
	vLen
)
{
	var vObjWidth;
	var vObjHeight;
	var vObjPanelWidth;
	var vObjPanelHeight;
	
	switch (vIndicator.suffix)
	{
		case "cbChip_Ones":
		case "cbChip_Ones1":
			vObjWidth = 40;
			vObjHeight = 40;
			vObjPanelWidth = 120;
			vObjPanelHeight = 211;
			break;
			
		case "cbChip_Tens":
		case "cbChip_Tens1":
		case "cbChip_Tenths":
		case "cbChip_Tenths1":
			vObjWidth = 40;
			vObjHeight = 40;
			vObjPanelWidth = 120;
			vObjPanelHeight = 211;
			break;
		
		case "cbChip_Hundreds":
		case "cbChip_Hundreds1":
		case "cbChip_Hundredths":
		case "cbChip_Hundredths1":	
			vObjWidth = 40;
			vObjHeight = 40;
			vObjPanelWidth = 120;
			vObjPanelHeight = 211;			
			break;		
			
		case "cbChip_Thousands":
		case "cbChip_Thousands1":
			vObjWidth = 40;
			vObjHeight = 40;
			vObjPanelWidth = 120;
			vObjPanelHeight = 211;			
			break;
	}
	
	if (mGrouping.mIsChipVersion)
	{
		vIndicator.x = mScene["Grouping"]["mcPanel_" + vKey].x + (vObjPanelWidth - vObjWidth * 5) / 2 + vLen % 5 * vObjWidth;
		vIndicator.y = mScene["Grouping"]["mcPanel_" + vKey].y + Math.floor(vLen / 5) * vObjHeight;
	}
	else
	{
		vIndicator.x = mScene["Grouping"]["mcPanel_" + vKey].x+ (vObjPanelWidth / Math.ceil(vTotal / 5) * Math.floor(vLen / 5)) + (vObjPanelWidth / Math.ceil(vTotal / 5) - vObjWidth) / 2;
		vIndicator.y = mScene["Grouping"]["mcPanel_" + vKey].y + (vLen % 5) * ((vObjPanelHeight - vObjHeight) / 4);
	}

	return {x:vIndicator.x, y:vIndicator.y};	
}

//----------------------------------------------------------------------------------------------------
// update the chips on stage
//----------------------------------------------------------------------------------------------------
function fRemoveChips()
{
	var i; 
	var j; 
	var k;
	var o; 
	var p; 
	var q;
	
	for ( i = 0 ; i < mGrouping.mChipobjArray.length ; i++)
	{
		for ( j = 0 ; j < mGrouping.mChipobjArray[i][1].length ; j++)
		{
			mScene["Grouping"].removeChild(mGrouping.mChipobjArray[i][1][j]);
		}
		mGrouping.mChipobjArray[i][1] = [];
	}
}
function
fSetSelection(
	vKey,
	vStart,
	vLen
)
{
	var i;
	var j;
	var k;
	var vList;
			
	return;	//remove selection color/state	
}

function
fAddGroup(
	vKey
)
{	
	var i;
	var vLen;
	var vList;
	var vIndicator;
	var vNewKey;
	
	stage.enableDOMEvents(false);
	
	mGrouping.mRegrouped = true;

	vNewKey = vKey.substr(0, vKey.indexOf("1"));
	mGrouping.mPanel = vNewKey;
	
	mGrouping.mStatusList[vKey].vCalculated = true;
	mGrouping.mStatusList[vNewKey].vCalculated = true;
	
	if (mGrouping.mNewCubeList[vKey].length == 0)
		mScene["Grouping"]["mcPanel_"+ vKey].gotoAndStop(1);
	else
		fSetSelection(vKey, 0, mGrouping.mNewCubeList[vKey].length);

	if (mGrouping.mNewCubeList[vNewKey].length == 0)
		mScene["Grouping"]["mcPanel_"+ vNewKey].gotoAndStop(1);
	else
		fSetSelection(vNewKey, 0, mGrouping.mNewCubeList[vNewKey].length);
		
	fUpdateSelectedNum();

	if (mGrouping.mNewCubeList[vKey].length == 0)
	{
		mGrouping.mStatusList[vKey].vGrouped = true;
		mGrouping.mStatusList[vNewKey].vGrouped = true;		
		setTimeout(fTimeClearSelection,1000);
		return;
	}

	vLen = mGrouping.mNewCubeList[vKey].length + mGrouping.mNewCubeList[vNewKey].length;
	if (mGrouping.mNewCubeList[vNewKey].length == 0)
		mScene["Grouping"]["mcPanel_"+ vNewKey].gotoAndStop(1);

	fSetSelection(vKey, 0, mGrouping.mNewCubeList[vKey].length);
	fSetSelection(vNewKey, 0, mGrouping.mNewCubeList[vNewKey].length);
	fUpdateSelectedNum();

	mGrouping.mAnimationList = [];
	mGrouping.mAnimationList[0] = [];
	
	for (i = 0; i < mGrouping.mNewCubeList[vKey].length; i++)
	{
		vIndicator = mGrouping.mNewCubeList[vKey][i];
		vIndicator.name = "mcNewModel_" + vNewKey + "_" + mGrouping.mNewCubeList[vNewKey].length;
		mGrouping.mAnimationList[0].push({vKey: vKey, vTarget: vIndicator, vNext: undefined, vStartPos: {x: vIndicator.x, y: vIndicator.y}, vEndPos: fGetNewPosAt(vNewKey, vLen, vIndicator, mGrouping.mNewCubeList[vNewKey].length), vSignal: ""});
		mGrouping.mNewCubeList[vNewKey].push(vIndicator);
	}
	mGrouping.mAnimationList[0][i - 1].vSignal = "Done";
	
	mGrouping.mNewCubeList[vKey] = [];
	
	mGrouping.mGroupN = 0;
	mGrouping.mAnimationN = 0;
	mGrouping.pState = "State_AddGroup";
	fStateAdd();
}

function fTimeClearSelection()
{
	mGrouping.mStatusList[mGrouping.mPanel].vGrouped = mGrouping.mNewCubeList[mGrouping.mPanel].length < 10;
	mGrouping.mStatusList[mGrouping.mPanel+1].vGrouped = mGrouping.mNewCubeList[mGrouping.mPanel+1].length < 10;
	fClearSelection();
	fUpdateSelectedNum();
	
	if((mGrouping.mNewCubeList["Tens"].length >= 10) && (!mGrouping.Ended) && (mGrouping.isfinal))
	{
		mGrouping.Ended = true;
		setTimeout(fActivateHundreds, 500);
	}	
	else if((mGrouping.mPanel == xKeyID2[0]) && (!mGrouping.Ended))	
	{
		fReduceAnswerZero();
		mScene["Grouping"]["mcInstruction"].fStop(4);
	}
	stage.enableDOMEvents(true);
}

function
fActivateHundreds()
{
	mScene["Grouping"]["mcInstruction"].fStop(3);
	mScene["Grouping"]["pbMove_Hundreds"].visible = true;
	mScene["Grouping"]["mcDisplay_Hundreds"].visible = true;
}

//added, shifting Tens to Hundreds(transit Tens together)
function
fShiftTensToHundred()
{
	var i, j;
	var o, p;
	
	for(i = 1 ; i < 10 ; i++)
	{
		if(i == 9)
		{
			cTransit.fStartTransit(mGrouping.mNewCubeList["Tens"][i], fCombineForHundred,
			{x: mGrouping.mNewCubeList["Tens"][i].x, y : mGrouping.mNewCubeList["Tens"][i].y}, 
				{x: mGrouping.mNewCubeList["Tens"][0].x, y : mGrouping.mNewCubeList["Tens"][0].y + (5 * i)}, createjs.Ease.linear, 600);
		}
		else {
			cTransit.fStartTransit(mGrouping.mNewCubeList["Tens"][i], null,
			{x: mGrouping.mNewCubeList["Tens"][i].x, y : mGrouping.mNewCubeList["Tens"][i].y}, 
				{x: mGrouping.mNewCubeList["Tens"][0].x, y : mGrouping.mNewCubeList["Tens"][0].y + (5 * i)}, createjs.Ease.linear, 600);	
		}
	}
}
//added, shifting Tens to Hundreds(remove Tens create Hundreds and display)
function
fCombineForHundred()
{
	var i, j;
	var o, p;
	
	o = fCloneDone(1,"Hundreds");
	mGrouping.SingleHundred = o[0];
	
	mGrouping.SingleHundred.x = mGrouping.mNewCubeList["Tens"][0].x;
	mGrouping.SingleHundred.y = mGrouping.mNewCubeList["Tens"][0].y;
	
	mGrouping.SingleHundred.visible = true;
	mGrouping.SingleHundred.name = "mcNewModel_Hundreds_0"; 
	
	mScene["Grouping"].addChild(mGrouping.SingleHundred);
	
	for(i = 0 ; i < 10 ; i++)
	{
		mScene["Grouping"].removeChild(mGrouping.mNewCubeList["Tens"][0]);		
		mGrouping.mNewCubeList["Tens"].shift(); 
	}			
	//move remain Tens to middle
	for(i = 0 ; i < mGrouping.mNewCubeList["Tens"].length ; i++)
	{
		cTransit.fStartTransit(mGrouping.mNewCubeList["Tens"][i], null,
			{x: mGrouping.mNewCubeList["Tens"][i].x}, 
			{x: mGrouping.mNewCubeList["Tens"][i].x - (45 - ( i >= 5 ? 30 : 5))}, createjs.Ease.linear, 1000);	
	}
	//move Hundreds cube from Tens place
	cTransit.fStartTransit(mGrouping.SingleHundred, fUpdateTextForHundreds,
		{x: mGrouping.SingleHundred.x}, 
		{x: mScene["Grouping"]["mcPanel_Hundreds"].x + 35}, createjs.Ease.linear, 1000);
}

function
fUpdateTextForHundreds()
{
	mScene["Grouping"]["tfNum_Hundreds2"].text = "1";
	mScene["Grouping"]["tfNum_Tens2"].text = mGrouping.mNewCubeList["Tens"].length;	
	mScene["Grouping"]["mcInstruction"].fStop(4);
	//fReduceAnswerZero();
	fReduceAnswerZero2();
}
//-----------------------------------------------------------------
function 
fStateAdd()
{
	cTransit.fStartTransit(mGrouping.mAnimationList[mGrouping.mGroupN][mGrouping.mAnimationN].vTarget, (mGrouping.pState == "State_AddGroup")?fAnimAddGroupDone:fDoneGroupSelection,
		{x: mGrouping.mAnimationList[mGrouping.mGroupN][mGrouping.mAnimationN].vStartPos.x, y : mGrouping.mAnimationList[mGrouping.mGroupN][mGrouping.mAnimationN].vStartPos.y}, 
		{x: mGrouping.mAnimationList[mGrouping.mGroupN][mGrouping.mAnimationN].vEndPos.x, y : mGrouping.mAnimationList[mGrouping.mGroupN][mGrouping.mAnimationN].vEndPos.y}, createjs.Ease.linear, 500);
						
	if (mGrouping.mAnimationList[mGrouping.mGroupN][mGrouping.mAnimationN].vSignal == "")
		fAnimaStop();
	
}
function fAnimaStop()
{
	if (++mGrouping.mAnimationN < mGrouping.mAnimationList[mGrouping.mGroupN].length)
	{
		fStateAdd();
	}
	else
	{
		if (++mGrouping.mGroupN < mGrouping.mAnimationList.length)
			fStateAdd();
		else
		{			
			fRearrangeCube(mGrouping.mPanel, mGrouping.mNewCubeList[mGrouping.mPanel].length);
			setTimeout(fTimeClearSelection,1000);			
		}
	}
}

function fAnimAddGroupDone()
{
	//left empty
	if (++mGrouping.mGroupN < mGrouping.mAnimationList.length)
		fStateAdd();
	else
	{
		fRearrangeCube(mGrouping.mPanel, mGrouping.mNewCubeList[mGrouping.mPanel].length);
		setTimeout(fTimeClearSelection,1000);
	}
}

function
fIsFitToNewPanel(
	vKey,
	vTotal
)
{
	return vTotal <= (mGrouping.mMaxCubeList[vKey] + 10);
}

function
fGroupSelection(
	vKey,
	vNewKey
)
{	
	var i;
	var j;
	var k;
	var p;
	var vList;
	var vArray;
	var vIndicator;
	var vLen;
	var vObjWidth;
	var vObjHeight;
	var vObjKeyWidth;
	var vObjKeyHeight;

	if (!fIsFitToNewPanel(vNewKey, mGrouping.mNewCubeList[vNewKey].length + 1))
	{
		mScene["Grouping"].tfWarning.text = "There is no enough space in the " + vNewKey + " column."; 
		mScene["Grouping"].tfWarning.visible = true;
		return;
	}
	
	mGrouping.mStatusList[vKey].vGrouped = true;
	mGrouping.mStatusList[vKey + 1].vGrouped = true;

	mGrouping.mRegrouped = true;

	vLen = mGrouping.mNewCubeList[vNewKey].length + 1;

	fRearrangeCube(vNewKey, vLen);
	
	vList = mGrouping.mNewCubeList[vKey].splice(0, 10);
	
	mGrouping.mAnimationList = [];
	
	switch(vNewKey)
	{	
		case "Ones":
		case "Ones1":
			vObjWidth = 7.3;
			vObjHeight = 8;			
			break;
		
		case "Tenths":
		case "Tenths1":	
		case "Tens":
		case "Tens1":
			vObjWidth = 28;
			vObjHeight = 16.5;			
			break;
			
		case "Hundredths":
		case "Hundredths1":			
		case "Hundreds":
		case "Hundreds1":
			vObjWidth = 32;
			vObjHeight = 17.1;
			break;
		
		case "Thousands":
		case "Thousands1":
			vObjWidth = 18.6;
			vObjHeight = 20;
			break;
	}
	
	switch(vKey)
	{	
		case "Ones":
		case "Ones1":
			vObjKeyWidth = 7.3;
			vObjKeyHeight = 8;			
			break;
			
		case "Tenths":
		case "Tenths1":	
		case "Tens":
		case "Tens1":
			vObjKeyWidth = 28;
			vObjKeyHeight = 16.5;			
			break;
			
		case "Hundredths":
		case "Hundredths1":	
		case "Hundreds":
		case "Hundreds1":
			vObjWidth = 32;
			vObjHeight = 17.1;
			break;
		
		case "Thousands":
		case "Thousands1":
			vObjWidth = 18.6;
			vObjHeight = 20;
			break;
	}	
	
	for (i = 0; i < 1; i++)
	{
		vIndicator = fCloneDone(1,vNewKey);
		for (k = 0; k < vIndicator.length; k++)
		{
			vIndicator[k].visible = false;
			vIndicator[k].name = "mcNewModel_" + vNewKey + "_" + mGrouping.mNewCubeList[vNewKey].length;
		
			mScene["Grouping"].addChild(vIndicator[k]);
			
			vIndicator[k].x = vList[i*10].x;
			vIndicator[k].y = vList[i*10].y;
			mGrouping.mAnimationList[i]=[];
			
			if (mGrouping.mIsChipVersion)
			{
				for (j = 0; j < 10; j++)
					mGrouping.mAnimationList[i].push({vKey: vKey, vTarget: vList[i * 10 + j], vNext: undefined, vStartPos: {x: vList[i*10+j].x, y: vList[i*10+j].y} , vEndPos: {x: vList[0].x,y: vList[0].y}, vSignal: ""});
			}
			else
			{
				for (j = 0; j < 10; j++)
				{
					mGrouping.mAnimationList[i].push({vKey: vKey, vTarget: vList[i * 10 + j], vNext: undefined, vStartPos: {x: vList[i*10+j].x, y: vList[i*10+j].y}, vEndPos: undefined, vSignal: ""});
					switch (vKey)
					{
					case "Ones":
						mGrouping.mAnimationList[i][j].vEndPos = new createjs.Point(vIndicator[k].x + j * ((vObjWidth - vObjKeyWidth) / 9), vIndicator[k].y + j * ((vObjHeight - vObjKeyHeight) / 9));
						break;
					
					case "Tenths":
					case "Hundredths":
						mGrouping.mAnimationList[i][j].vEndPos = new createjs.Point(vIndicator[k].x + vObjWidth / 2 - j * vObjWidth / 20, vIndicator[k].y + j * vObjHeight / 20);
						break;
					
					case "Hundreds":
						mGrouping.mAnimationList[i][j].vEndPos = new createjs.Point(vIndicator[k].x, vIndicator[k].y + j * (vObjHeight - vObjKeyHeight) / 9);
						break;
					}					
				}
			}			
			mGrouping.mAnimationList[i][j - 1].vSignal = "Done"; //Signal_Done;
			mGrouping.mAnimationList[i][j - 1].vNext = vIndicator[k];
			mGrouping.mAnimationList[i].push({vKey: vNewKey, vTarget: vIndicator[k], vNext: undefined, vStartPos: {x:vIndicator[k].x, y:vIndicator[k].y}, vEndPos: fGetNewPosAt(vNewKey, vLen, vIndicator[k], mGrouping.mNewCubeList[vNewKey].length), vSignal: "Done"});
			mGrouping.mNewCubeList[vNewKey].push(vIndicator[k]);			
		}		
	}

	stage.enableDOMEvents(false);
	mGrouping.mPanel = vKey;
	mGrouping.mGroupN = 0;
	mGrouping.mAnimationN = 0;
	mGrouping.pState = "State_GroupSelection";
	fStateAdd();
}
function fDoneGroupSelection()
{	
	if (mGrouping.mAnimationList[mGrouping.mGroupN]!=undefined &&(mGrouping.mAnimationN < mGrouping.mAnimationList[mGrouping.mGroupN].length - 1))
	{
		if (mGrouping.mAnimationList[mGrouping.mGroupN][mGrouping.mAnimationN].vSignal != "" && mGrouping.mAnimationList[mGrouping.mGroupN][mGrouping.mAnimationN].vNext != undefined)
		{
			for (i = 0; i <= mGrouping.mAnimationN; i++)
				mGrouping.mAnimationList[mGrouping.mGroupN][i].vTarget.visible = false;
				
			mGrouping.mAnimationList[mGrouping.mGroupN][mGrouping.mAnimationN].vNext.visible = true;
		}
		mGrouping.mAnimationN++;
		
		mGrouping.pState = "State_GroupSelection";
		fStateAdd();
		
		//update / show carry forward
		if(mThisVar.ClickedTarget == "Tenths")
			mScene["Grouping"]["tfNum_OnesRemain"].visible = true;
		else if(mThisVar.ClickedTarget == "Hundredths")
			mScene["Grouping"]["tfNum_TenthsRemain"].visible = true;	
		else if(mThisVar.ClickedTarget == "Ones")
			mScene["Grouping"]["tfNum_TensRemain"].visible = true;			
	}
	else
	{
		fResetAnimation(mGrouping.mPanel, mGrouping.mGroupN);
		
		if (++mGrouping.mGroupN < mGrouping.mAnimationList.length)
		{
			mGrouping.pState = "State_GroupSelection";
			fStateAdd();
		}
		else
		{
			fRearrangeCube(mGrouping.mPanel, mGrouping.mNewCubeList[mGrouping.mPanel].length);
			mGrouping.pState = "State_Idle";
			
			if(mGrouping.mGroupN ==10)
				stage.enableDOMEvents(true);			
		}
	}
}

function
fResetAnimation(
	vKey,
	vGroupN
) 
{	
	var i;
	var j;
	
	if(mGrouping.mAnimationList[vGroupN]!=undefined)
	for (i = 0; i < mGrouping.mAnimationList[vGroupN].length; i++)
	{
		if (mGrouping.mAnimationList[vGroupN][i].vKey == vKey)
		{
			j = mGrouping.mNewCubeList[vKey].indexOf(mGrouping.mAnimationList[vGroupN][i].vTarget);
			if (j != -1)
				mGrouping.mNewCubeList[vKey].splice(j, 1);
			
			j = mGrouping.mSelectedCubeList[vKey].indexOf(mGrouping.mAnimationList[vGroupN][i].vTarget);
			if (j != -1)
				mGrouping.mSelectedCubeList[vKey].splice(j, 1);

			mScene["Grouping"].removeChild(mGrouping.mAnimationList[vGroupN][i].vTarget);
		}
	}	
	fUpdateSelectedNum();
	mGrouping.mAnimationN = 0;
}

function
fBreakSelection(
	vKey,
	vNewKey
)
{		
	var i;
	var j;
	var k;
	var vLen;
	var vList;
	var vArray;
	var vOldCube;
	var vIndicator;
	
	if (!fIsFitToNewPanel(vNewKey, mGrouping.mNewCubeList[vNewKey].length + 10))
	{
		mScene["Grouping"].tfWarning.text = "There is no enough space in the " + vNewKey + " column."; 
		mScene["Grouping"].tfWarning.visible = true;
		return;
	}

	mGrouping.mRegrouped = true;
	mGrouping.mStatusList[vKey].vGrouped = true;
	
	vLen = mGrouping.mNewCubeList[vNewKey].length;
	
	fRearrangeCubeToRight(vNewKey, vLen + 10);
	mGrouping.mAnimationList = [];
	
	vOldCube = mGrouping.mNewCubeList[vKey].pop();
	
	switch(String(vOldCube.name).split("_")[1])
	{
		case "Tens":
		case "Tens1":
			vOldObjWidth = 42;
			vOldObjHeight = 24.7;
			break;		
	}
	switch(vNewKey)
	{	
		case "Ones":
		case "Ones1":
			vObjWidth = 7.3;
			vObjHeight = 8;
			break;
		
		case "Tens":
		case "Tens1":
			vObjWidth = 28;
			vObjHeight = 16.5;
			break;
		
		case "Hundreds":
		case "Hundreds1":
			vObjWidth = 32;
			vObjHeight = 17.1;
			break;
		
		case "Thousands":
		case "Thousands1":
			vObjWidth = 18.6;
			vObjHeight = 20;
			break;
	}
	
	switch(vKey)
	{	
		case "Ones":
		case "Ones1":
			vObjKeyWidth = 7.3;
			vObjKeyHeight = 8;
			break;
		
		case "Tens":
		case "Tens1":
			vObjKeyWidth = 28;
			vObjKeyHeight = 16.5;
			break;
		
		case "Hundreds":
		case "Hundreds1":
			vObjWidth = 32;
			vObjHeight = 17.1;
			break;
			
		case "Thousands":
		case "Thousands1":
			vObjWidth = 18.6;
			vObjHeight = 20;
			break;
	}
	
	for (i = 0; i < 1; i++)
	{
		mGrouping.mAnimationList[i] = [];
		mGrouping.mAnimationList[i].push({vKey: vKey, vTarget: vOldCube, vNext: vOldCube, vStartPos: {x:vOldCube.x,y:vOldCube.y}, vEndPos: {x:mScene["Grouping"]["mcPanel_" + vNewKey].x,y:mScene["Grouping"]["mcPanel_" + vNewKey].y}, vSignal: "Done"});

		vOldCube.x = mScene["Grouping"]["mcPanel_"+vNewKey].x;
		vOldCube.y = mScene["Grouping"]["mcPanel_"+vNewKey].y;
		
		for (j = 0; j < 10; j++)
		{
			vIndicator = fCloneDone(1,vNewKey);
			for (k = 0; k < vIndicator.length; k++)
			{
				vIndicator[k].name = "mcNewModel_" + vNewKey + "_" + mGrouping.mNewCubeList[vNewKey].length;
				vIndicator[k].x = mScene["Grouping"]["mcPanel_" + vNewKey].x;
				vIndicator[k].y = mScene["Grouping"]["mcPanel_" + vNewKey].y;
				vIndicator[k].visible = false;
				mScene["Grouping"].addChild(vIndicator[k]);
				
				vIndicator[k]["cbModel_" + vNewKey].fSelect(vOldCube["cbModel_" + vKey].Selected);
				if (mGrouping.mIsChipVersion)
					mGrouping.mAnimationList[i].push( { vKey: vNewKey, vTarget: vIndicator[k], vNext: undefined, vStartPos: fGetNewPosAt(vNewKey, vLen + 10,  vIndicator[k], 0), vEndPos: fGetNewPosAt(vNewKey, vLen + 10,  vIndicator[k], j), vSignal: "" } );
				else
				{
					mGrouping.mAnimationList[i].push( { vKey: vNewKey, vTarget:  vIndicator[k], vNext: undefined, vStartPos: undefined, vEndPos: fGetNewPosAt(vNewKey, vLen + 10,  vIndicator[k], j), vSignal: "" } );
					switch (vNewKey)
					{
						case "Ones":
							mGrouping.mAnimationList[i][j + 1].vStartPos = new createjs.Point(vOldCube.x + j * ((vOldObjWidth - vObjWidth) / 9), vOldCube.y + j * ((vOldObjHeight  - vObjHeight) / 9));
							break;
					
						case "Tens":
							mGrouping.mAnimationList[i][j + 1].vStartPos = new createjs.Point(vOldCube.x + vOldObjWidth / 2 - j * vOldObjWidth / 20, vOldCube.y + j * vOldObjHeight / 20);
							break;
						
						case "Hundreds":
							mGrouping.mAnimationList[i][j + 1].vStartPos = new createjs.Point(vOldCube.x, vOldCube.y + j * (vOldObjHeight  - vObjHeight) / 9);
							break;					
					}
				}
				mGrouping.mNewCubeList[vNewKey].push( vIndicator[k]);
				if(vOldCube["cbModel_" + vKey].Selected)
					fAddToSelection(vIndicator[k]);
			}
		}		
	}

	mGrouping.mPanel = vKey;
	mGrouping.mGroupN = 0;
	mGrouping.mAnimationN = 0;
	fGoBreakSelection();
}
function
fRearrangeCubeToRight(
	vKey,
	vLen
) 
{	
	var i;
	
	for (i = 0; i < mGrouping.mNewCubeList[vKey].length; i++)
	{
		mGrouping.mNewCubeList[vKey][i].x = (fGetNewPosAt(vKey, vLen, mGrouping.mNewCubeList[vKey][i], 10 + i)).x;
		mGrouping.mNewCubeList[vKey][i].y = (fGetNewPosAt(vKey, vLen, mGrouping.mNewCubeList[vKey][i], 10 + i)).y;	
	}
}
function 
fGoBreakSelection(
)
{
	cTransit.fStartTransit(mGrouping.mAnimationList[mGrouping.mGroupN][mGrouping.mAnimationN].vTarget, 
		fGoBreakSelectionDone,
		{x: mGrouping.mAnimationList[mGrouping.mGroupN][mGrouping.mAnimationN].vStartPos.x, y : mGrouping.mAnimationList[mGrouping.mGroupN][mGrouping.mAnimationN].vStartPos.y}, 
		{x: mGrouping.mAnimationList[mGrouping.mGroupN][mGrouping.mAnimationN].vEndPos.x, y : mGrouping.mAnimationList[mGrouping.mGroupN][mGrouping.mAnimationN].vEndPos.y}, 
		createjs.Ease.linear, 1000);						
	
		if (mGrouping.mAnimationList[mGrouping.mGroupN][mGrouping.mAnimationN].vSignal == "")
			fGoBreakSelectionDone();		
}
function 
fGoBreakSelectionDone(
)
{	
	if (mGrouping.mAnimationList[mGrouping.mGroupN]!= undefined &&(mGrouping.mAnimationN < mGrouping.mAnimationList[mGrouping.mGroupN].length - 1))
	{
		if (mGrouping.mAnimationList[mGrouping.mGroupN][mGrouping.mAnimationN].vSignal != "" && mGrouping.mAnimationList[mGrouping.mGroupN][mGrouping.mAnimationN].vNext != undefined)
		{
			mGrouping.mAnimationList[mGrouping.mGroupN][mGrouping.mAnimationN].vTarget.visible = false;		
			for (i = mGrouping.mAnimationN + 1; i < mGrouping.mAnimationList[mGrouping.mGroupN].length; i++)
				mGrouping.mAnimationList[mGrouping.mGroupN][i].vTarget.visible = true;
		}
		mGrouping.mAnimationN++;
		fGoBreakSelection();
	}
	else
	{
		fResetAnimation(mGrouping.mPanel, mGrouping.mGroupN);
		
		if(++mGrouping.mGroupN>10)
		{
			fTimeBreakDone();
		}
	}
}
function 
fTimeBreakDone(
)
{
	vNewKey = fGetNewKey(mGrouping.mPanel, "Break");
	fRearrangeCube(vNewKey, mGrouping.mNewCubeList[vNewKey].length);
	fUpdateSelectedNum();
	stage.enableDOMEvents(true);
}
function
fCloneDone(
	vData,vType
)
{
	var vClone = [];
	for (i = 0 ; i < vData; i++)
	{
		var Clone = new lib.ReturnClone(vType);
	
		cBase(Clone, "mc_cbChip_"+vType);				
		cMovieClip(Clone);
		Clone.visible = false;
		Clone.fEnable(false);
		
		vClone.push(Clone);
	}
	return vClone;
}

function
fDisableInput(vBool)
{
	var i;
	
	for(i = 0 ; i< mScene["Grouping"].numChildren; i++)
	{
		if(mScene["Grouping"].getChildAt(i).name != undefined)
		{
			if(mScene["Grouping"].getChildAt(i).prefix == "tfNum")
			{				
				mScene["Grouping"].getChildAt(i).fEnable(vBool);
			}
		}
	}
}

function
fValueMoreThanZero()
{
	/*var o, p;

	o = parseInt(mScene["Grouping"]["tfNum_Tens"].text + mScene["Grouping"]["tfNum_Ones"].text + mScene["Grouping"]["tfNum_Tenths"].text + mScene["Grouping"]["tfNum_Hundredths"].text);
	p = parseInt(mScene["Grouping"]["tfNum_Tens1"].text + mScene["Grouping"]["tfNum_Ones1"].text + mScene["Grouping"]["tfNum_Tenths1"].text + mScene["Grouping"]["tfNum_Hundredths1"].text);

	if((isNaN(o)) || (isNaN(p)))
		return false;
	else
		return true;*/
		
	var vTopValue;
	var vBottomValue;
	var vDiff = ["", "1"];		
		
	var xFrontKeyID = ["Tens", "Ones"];
	var xBackKeyID = ["Hundredths", "Tenths"];
	//handle the front	
	var vTracker = [];
	for(j = 0 ; j < vDiff.length ; j++) //input field set
	{
		var vTempFalse = false;	
		for(i = 0 ; i < xFrontKeyID.length ; i++)
		{
			if(mScene["Grouping"]["tfNum_" + xFrontKeyID[i] + vDiff[j]].text != "")	//from left check if not empty		
				vTempFalse = true;			
			else
			{
				if(!vTempFalse)	//when not empty, rest should also be non empty
				;
				else
					return false; // text is empty and there's a non empty text before it
			}
		}
		vTracker.push(vTempFalse);
	}
	//front is ok, can be all empty or all filled, just no gaps between number
	
	//check make sure fields are filled, example Tenths should be filled if Hundredths is filled
	for(j = 0 ; j < vDiff.length ; j++) //input field set
	{
		var vTempFalse = false;	
		for(i = 0 ; i < xBackKeyID.length ; i++)
		{
			if(mScene["Grouping"]["tfNum_" + xBackKeyID[i] + vDiff[j]].text != "")	//from left check if not empty		
				vTempFalse = true;			
			else
			{
				if(!vTempFalse)	//when not empty, rest should also be non empty
				;
				else
					return false; // text is empty and there's a non empty text before it
			}
		}
	}
	//to make sure each column in tenths is filled
	if ((mScene["Grouping"]["tfNum_Tenths" + vDiff[0]].text == "") || (mScene["Grouping"]["tfNum_Tenths" + vDiff[1]].text == ""))
		return false;
		
	//to make sure atleast 1 column in hundredths is filled, the other can be blank and 0 will be auto added
	if ((mScene["Grouping"]["tfNum_Hundredths" + vDiff[0]].text == "") && (mScene["Grouping"]["tfNum_Hundredths" + vDiff[1]].text == ""))
		return false;
	
	//all ok
	return true;	
}

function
fFillRemoveZeros()
{
	var i, j;
	var o, p;

	o = false;
	for(i = xKeyID.length - 1 ; i >= 0 ; i--)
	{
		if(!isNaN(parseInt(mScene["Grouping"]["tfNum_" + xKeyID[i]].text)) && (parseInt(mScene["Grouping"]["tfNum_" + xKeyID[i]].text) > 0))
			o = true;
			
		if(xKeyID[i] == "Ones")
			o = true;
			
		mScene["Grouping"]["tfNum_" + xKeyID[i]].text = (!o) ? "" : (mScene["Grouping"]["tfNum_" + xKeyID[i]].text == "" ? "0" : mScene["Grouping"]["tfNum_" + xKeyID[i]].text); 	
	
		if((!o) && (i == 0))
			mScene["Grouping"]["tfNum_" + xKeyID[i]].text = "0";
	}

	o = false;
	for(i = xKeyID.length - 1 ; i >= 0 ; i--)
	{	
		if(!isNaN(parseInt(mScene["Grouping"]["tfNum_" + xKeyID[i] + "1"].text)) && (parseInt(mScene["Grouping"]["tfNum_" + xKeyID[i] + "1"].text) > 0))
			o = true;
			
		if(xKeyID[i] == "Ones")
			o = true;	
			
		mScene["Grouping"]["tfNum_" + xKeyID[i] + "1"].text = (!o) ? "" : (mScene["Grouping"]["tfNum_" + xKeyID[i] + "1"].text == "" ? "0" : mScene["Grouping"]["tfNum_" + xKeyID[i] + "1"].text); 	
	
		if((!o) && (i == 0))
			mScene["Grouping"]["tfNum_" + xKeyID[i] + "1"].text = "0";
	}
}

function
fReduceAnswerZero()
{
	var vTopValue;
	var vBottomValue;
	var vDiff = ["2"];	
		
	for(j = 0 ; j < vDiff.length ; j++) //key
	{
		var vTempFalse = false;	
		for(i = 0 ; i < xKeyID2.length ; i++)
		{
			if((mScene["Grouping"]["tfNum_" + xKeyID2[i] + vDiff[j]].text != "") && (parseInt(mScene["Grouping"]["tfNum_" + xKeyID2[i] + vDiff[j]].text) > 0))	//from left check if not empty		
				vTempFalse = true;		
				
			mScene["Grouping"]["tfNum_" + xKeyID2[i] + vDiff[j]].text = String(mScene["Grouping"]["tfNum_" + xKeyID2[i] + vDiff[j]].text) == "0" ? (vTempFalse ? "0" : "") : mScene["Grouping"]["tfNum_" + xKeyID2[i] + vDiff[j]].text;
		}
	}		
}

function
fReduceAnswerZero2()
{
	var vTopValue;
	var vBottomValue;
	var vDiff = ["2"];	
		
				
	for(j = 0 ; j < vDiff.length ; j++) //key
	{
		var vTempFalse = false;	
		for(i = 0 ; i < xKeyID.length ; i++)
		{			
			if((mScene["Grouping"]["tfNum_" + xKeyID[i] + vDiff[j]].text != "") && (parseInt(mScene["Grouping"]["tfNum_" + xKeyID[i] + vDiff[j]].text) > 0))	//from left check if not empty	
				vTempFalse = true;		
					
			mScene["Grouping"]["tfNum_" + xKeyID[i] + vDiff[j]].text = String(mScene["Grouping"]["tfNum_" + xKeyID[i] + vDiff[j]].text) == "0" ? (vTempFalse ? "0" : "") : mScene["Grouping"]["tfNum_" + xKeyID[i] + vDiff[j]].text;	
						

			if("Tenths" == xKeyID[i])
				return;
		}
	}		
}

//----------------------------------------------------------------------------------------------------
return Engine;
})();
