// components/UniversalFileViewer.jsx
import { Button, Image, Space } from 'antd';
import {
    DownloadOutlined,
    RotateLeftOutlined,
    RotateRightOutlined,
    SwapOutlined,
    ZoomInOutlined,
    ZoomOutOutlined,
} from '@ant-design/icons';
interface Props {
    fileUrl: string;
    fileType: string;
}
const UniversalUpdateFileViewer = ({ fileUrl, fileType}: Props) => {
    const renderFile = () => {
        const tipo = fileType.split('/')
        switch (tipo[0]) {
            case 'application':
                switch (tipo[1]) {
                    case 'pdf':
                        return (
                            <div>
                                <button >
                                    <img src='/images/tipos/pdf.png' className='max-h-[150px] mx-auto' />

                                </button>

                            </div>
                        )
                    case 'vnd.openxmlformats-officedocument.wordprocessingml.document':
                        return (
                            <div>
                                <a href={fileUrl} download target='_blank'>
                                    <img src='/images/tipos/docx.png' className='max-h-[150px] mx-auto' />

                                </a>

                            </div>
                        )
                    case 'vnd.ms-excel':
                        return (
                            <div>
                                <a href={fileUrl} download target='_blank'>
                                    <img src='/images/tipos/xls.png' className='max-h-[150px] mx-auto' />

                                </a>

                            </div>
                        )
                    case 'vnd.ms-powerpoint':
                        return (
                            <div>
                                <a href={fileUrl} download target='_blank'>
                                    <img src='/images/tipos/ppt.png' className='max-h-[150px] mx-auto' />

                                </a>

                            </div>
                        )
                    default:
                        return (
                            <div>
                                <a href={fileUrl} download target='_blank'>
                                    <img src='/images/tipos/indefinido.png' className='max-h-[150px] mx-auto' />
                                </a>

                            </div>
                        )
                }
            case 'image':
                return (
                    <div>
                        <div className='flex justify-center'>
                            <Image
                                src={fileUrl} className='max-h-[150px] '
                                preview={{
                                    toolbarRender: (
                                        _,
                                        {
                                            transform: { scale },
                                            actions: {
                                                onFlipY,
                                                onFlipX,
                                                onRotateLeft,
                                                onRotateRight,
                                                onZoomOut,
                                                onZoomIn
                                            },
                                        },
                                    ) => (
                                        <Space size={14} className="toolbar-wrapper">
                                            <a href={fileUrl} download target='_blank'>
                                                <Button icon={<DownloadOutlined />} />
                                            </a>

                                            <Button icon={<SwapOutlined />} onClick={onFlipY} style={{ fontSize: '20px' }} />
                                            <Button icon={<SwapOutlined />} onClick={onFlipX} style={{ fontSize: '20px' }} />
                                            <Button icon={<RotateLeftOutlined />} onClick={onRotateLeft} style={{ fontSize: '20px' }} />
                                            <Button icon={<RotateRightOutlined />} onClick={onRotateRight} style={{ fontSize: '20px' }} />
                                            <Button icon={<ZoomOutOutlined />} disabled={scale === 1} onClick={onZoomOut} style={{ fontSize: '20px' }} />
                                            <Button icon={<ZoomInOutlined />} disabled={scale === 50} onClick={onZoomIn} style={{ fontSize: '20px' }} />
                                        </Space>
                                    ),
                                }}

                            />
                        </div>
                    </div>
                )

            case 'video':
                return (
                    <div>

                        <button >
                            <video src={fileUrl} className='mx-auto' />
                        </button>

                    </div>
                )

            case 'text':
                switch (tipo[1]) {
                    case 'csv':
                        return (
                            <div>
                                <a href={fileUrl} download target='_blank'>
                                    <img src='/images/tipos/csv.png' className='max-h-[150px] mx-auto' />
                                </a>

                            </div>
                        )
                }
            default:
                return (
                    <div>
                        <a href={fileUrl} download target='_blank'>
                            <img src='/images/tipos/indefinido.png' className='max-h-[150px] mx-auto' />
                        </a>

                    </div>
                )
        }
    };

    return <div>{renderFile()}</div>;
};

export default UniversalUpdateFileViewer;